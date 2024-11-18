/*
 * Copyright (C) 2024 - present Instructure, Inc.
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

import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {
  RubricAssignmentContainer,
  type RubricAssignmentContainerProps,
} from '../components/RubricAssignmentContainer'
import * as RubricFormQueries from '@canvas/rubrics/react/RubricForm/queries/RubricFormQueries'
import {RUBRIC, RUBRIC_ASSOCIATION, RUBRIC_CONTEXTS, RUBRICS_FOR_CONTEXT} from './fixtures'
import {queryClient} from '@canvas/query'

jest.mock('@canvas/rubrics/react/RubricForm/queries/RubricFormQueries', () => ({
  ...jest.requireActual('@canvas/rubrics/react/RubricForm/queries/RubricFormQueries'),
  saveRubric: jest.fn(),
}))

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  removeRubricFromAssignment: jest.fn(),
  addRubricToAssignment: jest.fn(),
  getGradingRubricContexts: jest.fn(),
  getGradingRubricsForContext: jest.fn(),
}))

describe('RubricAssignmentContainer Tests', () => {
  beforeEach(() => {
    jest.spyOn(RubricFormQueries, 'saveRubric').mockImplementation(() =>
      Promise.resolve({
        rubric: RUBRIC,
        rubricAssociation: RUBRIC_ASSOCIATION,
      })
    )

    queryClient.setQueryData(['fetchGradingRubricContexts', '1'], RUBRIC_CONTEXTS)
    queryClient.setQueryData(
      ['fetchGradingRubricsForContext', '1', 'course_2'],
      RUBRICS_FOR_CONTEXT
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (props: Partial<RubricAssignmentContainerProps> = {}) => {
    return render(
      <RubricAssignmentContainer
        accountMasterScalesEnabled={false}
        assignmentId="1"
        courseId="1"
        contextAssetString="course_1"
        canManageRubrics={true}
        {...props}
      />
    )
  }

  describe('non associated rubric', () => {
    it('should render the create and search buttons', () => {
      const {getByTestId} = renderComponent()
      expect(getByTestId('create-assignment-rubric-button')).toHaveTextContent('Create Rubric')
      expect(getByTestId('find-assignment-rubric-button')).toHaveTextContent('Find Rubric')
    })

    it('should not render the create when manage_rubrics permissions is false', () => {
      const {getByTestId, queryByTestId} = renderComponent({canManageRubrics: false})
      expect(queryByTestId('create-assignment-rubric-button')).toBeNull()
      expect(getByTestId('find-assignment-rubric-button')).toHaveTextContent('Find Rubric')
    })

    it('should render the create modal when the create button is clicked', () => {
      const {getByTestId} = renderComponent()
      getByTestId('create-assignment-rubric-button').click()
      expect(getByTestId('rubric-assignment-create-modal')).toHaveTextContent('Create Rubric')
      expect(getByTestId('save-rubric-button')).toBeDisabled()
    })

    it('should save a new rubric and display the Rubric title, edit, preview, and remove buttons', async () => {
      const {getByTestId} = renderComponent()
      getByTestId('create-assignment-rubric-button').click()
      const titleInput = getByTestId('rubric-form-title')
      fireEvent.change(titleInput, {target: {value: 'Rubric 1'}})
      fireEvent.click(getByTestId('add-criterion-button'))

      await new Promise(resolve => setTimeout(resolve, 0))
      expect(getByTestId('rubric-criterion-modal')).toBeInTheDocument()
      fireEvent.change(getByTestId('rubric-criterion-name-input'), {
        target: {value: 'New Criterion Test'},
      })
      fireEvent.click(getByTestId('rubric-criterion-save'))
      fireEvent.click(getByTestId('save-rubric-button'))

      await new Promise(resolve => setTimeout(resolve, 0))
      expect(document.querySelector('#flash_screenreader_holder')?.textContent).toEqual(
        'Rubric saved successfully'
      )
      expect(getByTestId('preview-assignment-rubric-button')).toBeInTheDocument()
      expect(getByTestId('edit-assignment-rubric-button')).toBeInTheDocument()
      expect(getByTestId('remove-assignment-rubric-button')).toBeInTheDocument()
    })
  })

  describe('associated rubric', () => {
    it('will render the rubric title, edit, preview, and remove buttons when rubric is attached to assignment', () => {
      const {getByTestId} = renderComponent({
        assignmentRubric: RUBRIC,
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })
      expect(getByTestId('preview-assignment-rubric-button')).toBeInTheDocument()
      expect(getByTestId('edit-assignment-rubric-button')).toBeInTheDocument()
      expect(getByTestId('remove-assignment-rubric-button')).toBeInTheDocument()
    })

    it('will not render the edit button when can_manage_rubrics is false', () => {
      const {getByTestId, queryByTestId} = renderComponent({
        assignmentRubric: RUBRIC,
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
        canManageRubrics: false,
      })
      expect(getByTestId('preview-assignment-rubric-button')).toBeInTheDocument()
      expect(queryByTestId('edit-assignment-rubric-button')).toBeNull()
      expect(getByTestId('remove-assignment-rubric-button')).toBeInTheDocument()
    })

    it('should render the create modal when the edit button is clicked', () => {
      const {getByTestId} = renderComponent({
        assignmentRubric: RUBRIC,
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })
      fireEvent.click(getByTestId('edit-assignment-rubric-button'))
      expect(getByTestId('rubric-assignment-create-modal')).toHaveTextContent('Edit Rubric')
      expect(getByTestId('rubric-form-title')).toHaveValue('Rubric 1')
    })

    it('should remove the rubric from the assignment when the remove button is clicked', async () => {
      const {getByTestId} = renderComponent({
        assignmentRubric: RUBRIC,
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })
      fireEvent.click(getByTestId('remove-assignment-rubric-button'))
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(getByTestId('create-assignment-rubric-button')).toBeInTheDocument()
      expect(getByTestId('find-assignment-rubric-button')).toBeInTheDocument()
    })

    it('should open the preview tray when the preview button is clicked', async () => {
      const {getByTestId} = renderComponent({
        assignmentRubric: RUBRIC,
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })
      fireEvent.click(getByTestId('preview-assignment-rubric-button'))
      const rubricTray = document.querySelector(
        '[role="dialog"][aria-label="Rubric Assessment Tray"]'
      )
      expect(rubricTray).toBeInTheDocument()
      expect(getByTestId('traditional-criterion-1-ratings-0')).toBeInTheDocument()
      expect(getByTestId('traditional-criterion-1-ratings-1')).toBeInTheDocument()
    })

    it('should open the edit copy confirmation modal when the edit button is clicked and user cannot update rubric', () => {
      const {getByTestId, queryByTestId} = renderComponent({
        assignmentRubric: {...RUBRIC, can_update: false},
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })

      getByTestId('edit-assignment-rubric-button').click()
      expect(queryByTestId('copy-edit-confirm-modal')).toBeInTheDocument()
    })

    it('should not open the edit modal when the user does not confirm in the copy edit modal', () => {
      const {getByTestId, queryByTestId} = renderComponent({
        assignmentRubric: {...RUBRIC, can_update: false},
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })

      getByTestId('edit-assignment-rubric-button').click()
      getByTestId('copy-edit-cancel-btn').click()
      expect(queryByTestId('rubric-assignment-create-modal')).not.toBeInTheDocument()
    })

    it('should continue to the edit modal when the user confirms in the copy edit modal', () => {
      const {getByTestId, queryByTestId} = renderComponent({
        assignmentRubric: {...RUBRIC, can_update: false},
        assignmentRubricAssociation: RUBRIC_ASSOCIATION,
      })

      getByTestId('edit-assignment-rubric-button').click()
      getByTestId('copy-edit-confirm-btn').click()
      expect(queryByTestId('rubric-assignment-create-modal')).toBeInTheDocument()
    })
  })

  describe('search tray', () => {
    it('should open search tray when search button is clicked and load the correct rubric contexts', async () => {
      const {getByTestId, getByText} = renderComponent()
      fireEvent.click(getByTestId('find-assignment-rubric-button'))

      expect(getByTestId('rubric-search-tray')).toBeInTheDocument()

      const comboBox = getByTestId('rubric-context-select') as HTMLInputElement
      expect(comboBox.value).toEqual('Account 1 (Account)')

      fireEvent.click(comboBox)
      expect(getByText('Course 1 (Course)')).toBeInTheDocument()
      expect(getByText('Course 2 (Course)')).toBeInTheDocument()
    })

    it('should display the correct rubrics when clicking on a context', async () => {
      const {getByTestId, getByText, queryAllByTestId} = renderComponent()
      fireEvent.click(getByTestId('find-assignment-rubric-button'))

      expect(getByTestId('rubric-search-tray')).toBeInTheDocument()

      const comboBox = getByTestId('rubric-context-select') as HTMLInputElement
      expect(comboBox.value).toEqual('Account 1 (Account)')

      fireEvent.click(comboBox)

      const comboBoxOption = getByText('Course 2 (Course)')
      fireEvent.click(comboBoxOption)

      const rubricRowTitles = queryAllByTestId('rubric-search-row-title')
      expect(rubricRowTitles).toHaveLength(2)
      expect(rubricRowTitles[0]).toHaveTextContent('Rubric 1')
      expect(rubricRowTitles[1]).toHaveTextContent('Rubric 2')

      const rubricRowData = queryAllByTestId('rubric-search-row-data')
      expect(rubricRowData).toHaveLength(2)
      expect(rubricRowData[0]).toHaveTextContent('10 pts | 1 criterion')
      expect(rubricRowData[1]).toHaveTextContent('20 pts | 1 criterion')

      const rubricPreviewButtons = queryAllByTestId('rubric-preview-btn')
      expect(rubricPreviewButtons).toHaveLength(2)
    })

    it('should open rubric preview tray when preview button is clicked', async () => {
      const {getByTestId, getByText, queryAllByTestId} = renderComponent()
      fireEvent.click(getByTestId('find-assignment-rubric-button'))

      expect(getByTestId('rubric-search-tray')).toBeInTheDocument()

      const comboBox = getByTestId('rubric-context-select') as HTMLInputElement
      expect(comboBox.value).toEqual('Account 1 (Account)')

      fireEvent.click(comboBox)

      const comboBoxOption = getByText('Course 2 (Course)')
      fireEvent.click(comboBoxOption)

      const rubricPreviewButtons = queryAllByTestId('rubric-preview-btn')

      fireEvent.click(rubricPreviewButtons[0])
      expect(getByTestId('traditional-criterion-1-ratings-0')).toBeInTheDocument()
    })
  })
})