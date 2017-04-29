import _ from 'lodash';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { handleAction } from 'redux-actions';

import activeVisualization from './activeVisualization.js';
import visualizations from './visualizations.js';
import config from './config.js';
import commits from './commits.js';
import notifications from './notifications.js';
import progress from './progress.js';

const app = combineReducers( {
  activeVisualization,
  visualizations,
  config,
  commits,
  notifications,
  progress,
  form: formReducer.plugin( {
    configForm: handleAction( 'RECEIVE_CONFIGURATION', function( state, action ) {
      const config = action.payload;
      return _.merge( {}, state, {
        values: {
          gitlabUrl: _.get( config, 'gitlab.url' ),
          gitlabToken: _.get( config, 'gitlab.token' )
        }
      } );
    }, {} )
  } )
} );

export default app;