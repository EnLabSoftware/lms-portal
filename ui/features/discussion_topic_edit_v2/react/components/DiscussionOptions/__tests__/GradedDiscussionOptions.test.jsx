/*
 * Copyright (C) 2023 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {render} from '@testing-library/react'
import fetchMock from 'fetch-mock'
import React from 'react'

import {GradedDiscussionOptions} from '../GradedDiscussionOptions'

const defaultProps = {
  assignmentGroups: [],
  pointsPossible: 10,
  setPointsPossible: () => {},
  displayGradeAs: 'points',
  setDisplayGradeAs: () => {},
  assignmentGroup: '',
  setAssignmentGroup: () => {},
  peerReviewAssignment: '',
  setPeerReviewAssignment: () => {},
  peerReviewsPerStudent: 0,
  setPeerReviewsPerStudent: () => {},
  peerReviewDueDate: '',
  setPeerReviewDueDate: () => {},
  assignedInfoList: [],
  setAssignedInfoList: () => {},
  isCheckpoints: false,
  canManageAssignTo: true,
}

const SECTIONS_URL = `/api/v1/courses/1/sections?per_page=100`
const STUDENTS_URL = `api/v1/courses/1/users?per_page=100&enrollment_type=student`
const COURSE_SETTINGS_URL = `/api/v1/courses/1/settings`

const renderGradedDiscussionOptions = (props = {}) => {
  return render(<GradedDiscussionOptions {...defaultProps} {...props} />)
}
describe('GradedDiscussionOptions', () => {
  it('renders', () => {
    const {getByText} = renderGradedDiscussionOptions()
    expect(getByText('Points Possible')).toBeInTheDocument()
    expect(getByText('Display Grade As')).toBeInTheDocument()
    expect(getByText('Assignment Group')).toBeInTheDocument()
    expect(getByText('Peer Reviews')).toBeInTheDocument()
    expect(getByText('Assignment Settings')).toBeInTheDocument()
  })

  it('renders with null points possible value', () => {
    const {getByText} = renderGradedDiscussionOptions({pointsPossible: null})
    expect(getByText('Points Possible')).toBeInTheDocument()
    expect(getByText('Display Grade As')).toBeInTheDocument()
    expect(getByText('Assignment Group')).toBeInTheDocument()
    expect(getByText('Peer Reviews')).toBeInTheDocument()
    expect(getByText('Assignment Settings')).toBeInTheDocument()
  })

  describe('Checkpoints', () => {
    it('renders the section Checkpoint Settings when the checkpoints checkbox is selected', () => {
      const {getByText} = renderGradedDiscussionOptions({isCheckpoints: true})
      expect(getByText('Checkpoint Settings')).toBeInTheDocument()
    })
  })

  describe('with selective_release_ui_api enabled', () => {
    beforeEach(() => {
      fetchMock.get(SECTIONS_URL, [])
      fetchMock.get(STUDENTS_URL, [])
      fetchMock.get(COURSE_SETTINGS_URL, {hide_final_grades: false})
      ENV.FEATURES.selective_release_ui_api = true
      ENV.COURSE_ID = '1'
    })

    it('does not render assignment settings if canManageAssignTo is false', () => {
      const {getByText, queryByText, rerender} = renderGradedDiscussionOptions({
        canManageAssignTo: true,
      })
      expect(getByText('Assignment Settings')).toBeInTheDocument()
      rerender(<GradedDiscussionOptions {...defaultProps} canManageAssignTo={false} />)
      expect(queryByText('Assignment Settings')).not.toBeInTheDocument()
    })
  })
})