'use strict';

import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';

import styles from '../styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';
import CommitMarker from './CommitMarker.js';
import StackedArea from './StackedArea.js';

import Legend from '../../../components/Legend';
import ZoomableChartContainer from '../../../components/svg/ZoomableChartContainer.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import * as zoomUtils from '../../../utils/zoom.js';

const dateExtractor = d => d.date;

export default class CodeOwnershipRiver extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};

    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(props);

    this.state = {
      dirty: true,
      isPanning: false,
      lastCommitDataPoint,
      commitLegend,
      commitSeries,
      dimensions: zoomUtils.initialDimensions()
    };

    const x = d3.scaleTime().rangeRound([0, 0]);
    const y = d3.scaleLinear().rangeRound([0, 0]);

    this.scales = {
      x,
      y,
      scaledX: x,
      scaledY: y
    };

    this.commitExtractors = {
      x: d => d.date
    };

    this.updateDomain(props);
    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: true, margin: 50 });
  }

  updateDomain(data) {
    if (!data.commits) {
      return;
    }

    const commitDateExtent = d3.extent(data.commits, d => d.date);
    const commitCountExtent = [0, _.last(data.commits).totals.count];

    const issueDateExtent = d3.extent(data.issues, d => d.createdAt);
    const issueCountExtent = d3.extent(data.issues, d => d.count);

    const buildDateExtent = d3.extent(data.builds, b => b.date);
    const buildCountExtent = d3.extent(data.builds, b => b.stats.total);

    const min = arr => _.min(_.pull(arr, null));
    const max = arr => _.max(_.pull(arr, null));

    this.scales.x.domain([
      min([commitDateExtent[0], issueDateExtent[0], buildDateExtent[0]]),
      max([commitDateExtent[1], issueDateExtent[1], buildDateExtent[1]])
    ]);

    this.scales.y.domain([
      min([
        this.scales.y.domain()[0],
        commitCountExtent[0],
        issueCountExtent[0],
        buildCountExtent[0]
      ]),
      max([
        this.scales.y.domain()[1],
        commitCountExtent[1],
        issueCountExtent[1],
        buildCountExtent[1]
      ])
    ]);
  }

  componentWillReceiveProps(nextProps) {
    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(nextProps);
    this.setState(
      {
        lastCommitDataPoint,
        commitSeries,
        commitLegend
      },
      () => this.updateDomain(nextProps)
    );
  }

  render() {


    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            CI System
          </div>
          <div className={styles.chart}>

          </div>
        </div>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            Issues
          </div>
          <div className={styles.chart}>

          </div>
        </div>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            Changes
          </div>
          <div className={styles.chart}>

          </div>
        </div>
      </div>
    );
  }

  activateLegend(legend) {
    this.setState({ hoverHint: legend });
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    const lastCommitDataPoint = _.last(props.commits).statsByAuthor;
    const commitLegend = [];
    const commitSeries = _.map(lastCommitDataPoint, (committerIndex, signature) => {
      const legend = {
        name:
          (props.commitAttribute === 'count' ? 'Commits by ' : 'Changes by ') +
          (signature === 'other' ? props.otherCount + ' Others' : signature),
        style: {
          fill: props.palette[signature]
        }
      };

      commitLegend.push(legend);

      return {
        style: {
          fill: props.palette[signature]
        },
        extractY: d => {
          const stats = d.statsByAuthor[signature];
          if (props.commitAttribute === 'count') {
            return stats ? stats.count : 0;
          } else {
            return stats ? stats.changes / d.totals.changes * d.totals.count : 0;
          }
        },
        onMouseEnter: () => this.activateLegend(legend),
        onMouseLeave: () => this.activateLegend(null)
      };
    });

    return { commitSeries, commitLegend };
  }
}

const openIssuesLegend = {
  name: 'Open issues',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860'
  }
};

const closedIssuesLegend = {
  name: 'Closed issues',
  style: {
    fill: '#73e79c'
  }
};

const unsuccessfulBuildsLegend = {
  name: 'Unsuccessful builds',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860'
  }
};

const successfulBuildsLegend = {
  name: 'Successful builds',
  style: {
    fill: '#73e79c'
  }
};