'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, throttle, put, cancel } from 'redux-saga/effects';

import { fetchConfig, watchConfig } from './config.js';
import { fetchIssueImpactData, watchSetActiveIssue } from './IssueImpact.js';
import { watchNotifications } from './notifications.js';

import codeOwnershipRiver from '../visualizations/code-ownership-river/sagas';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];

export const switchVisualization = createAction('SWITCH_VISUALIZATION', vis => vis);
export const showCommit = createAction('SHOW_COMMIT');

const componentSagas = {
  CODE_OWNERSHIP_RIVER: codeOwnershipRiver
};
let currentComponentSaga = null;

function* switchComponentSaga(sagaName) {
  if (currentComponentSaga) {
    yield cancel(currentComponentSaga);
  }

  currentComponentSaga = componentSagas[sagaName];
  yield fork(currentComponentSaga);
}

export function* root() {
  yield* fetchConfig();

  const { activeVisualization } = yield select();
  yield* switchComponentSaga(activeVisualization);
  yield fork(watchShowCommits);
  yield fork(watchConfig);
  yield fork(watchVisualization);
  yield fork(watchNotifications);
  // yield fork(watchSetActiveIssue);
  // yield fork(watchMessages);
}

function* watchVisualization() {
  yield takeEvery('SWITCH_VISUALIZATION', function*() {
    const { activeVisualization } = yield select();
    switchComponentSaga(activeVisualization);
  });
}

function* watchShowCommits() {
  yield takeEvery('SHOW_COMMIT', function*(a) {
    const { config } = yield select();
    window.open(`${config.data.projectUrl}/commit/${a.payload.sha}`);
  });
}
