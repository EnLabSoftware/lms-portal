//
// Copyright (C) 2013 - present Instructure, Inc.
//
// This file is part of Canvas.
//
// Canvas is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, version 3 of the License.
//
// Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License along
// with this program. If not, see <http://www.gnu.org/licenses/>.

import React from 'react'
import ReactDOM from 'react-dom'
import {IconButton} from '@instructure/ui-buttons'
import {Tooltip} from '@instructure/ui-tooltip'
import {IconArrowEndLine, IconArrowStartLine} from '@instructure/ui-icons'
import $ from 'jquery'
import {find} from 'lodash'
import template from '../jst/CourseOutline.handlebars'
import {useScope as useI18nScope} from '@canvas/i18n'
import htmlEscape from '@instructure/html-escape'
import '@canvas/jquery/jquery.ajaxJSON'


// Summary
//   Creates a new ModuleSequenceFooter so clicking to see the next item in a module
//   can be done easily.
//
//   Required options:
//     assetType : string
//     assetID   : integer
//
//   ie:
//     $('#footerDiv').moduleSequenceFooter({
//       assetType: 'Assignment'
//       assetID: 1
//       courseID: 25
//     })
//
//   You can optionally set options on the prototype for all instances of this plugin by default
//   by doing:
//
//   $.fn.moduleSequenceFooter.options = {
//     assetType: 'Assignment'
//     assetID: 1
//     courseID: 25
//   }

$.fn.moduleCourseOutline = function (options = {}) {
  this.msfInstance = new $.fn.moduleCourseOutline.MSFClass(options)
  this.html(template())
  this.show()
  console.log(this)
  return this
}

export default class ModuleCourseOutline {
  // Icon class map used to determine which icon class should be placed
  // on a tooltip
  // @api private

  iconClasses = {
    ModuleItem: 'icon-module',
    File: 'icon-paperclip',
    Page: 'icon-document',
    Discussion: 'icon-discussion',
    Assignment: 'icon-assignment',
    Quiz: 'icon-quiz',
    ExternalTool: 'icon-link',
    ExternalUrl: 'icon-link',
    'Lti::MessageHandler': 'icon-link',
  }

  // Sets up the class variables and generates a url. Fetch should be
  // called somewhere else to set up the data.

  constructor(options = {}) {
  }



}

$.fn.moduleCourseOutline.MSFClass = ModuleCourseOutline
