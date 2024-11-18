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

import doFetchApi from '@canvas/do-fetch-api-effect'
import {showFlashError} from '@canvas/alerts/react/FlashAlert'
import {useScope as useI18nScope} from '@canvas/i18n'
import {type AssigneeOption} from '../../react/Item/types'
import {getStudentsByCourse} from './getStudentsByCourse'

const I18n = useI18nScope('differentiated_modules')

type JSONResult = {id: string; name: string; group_category_id: string}[]

export const processResult = async (
  result: PromiseSettledResult<{
    response: any
    json: JSONResult
    link?: {next: {url: string}}
  }> | null,
  key: string,
  groupKey: string
) => {
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  if (result && !result?.response?.ok)
    throw new Error(I18n.t('Failed to load %{groupKey} data', {groupKey}))

  let resultParsedResult: AssigneeOption[] = []
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  let resultJSON = result.json
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  if (result.link?.next) {
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    resultJSON = await fetchNextPages(result.link.next, resultJSON)
  }
  resultParsedResult =
    resultJSON?.map(
      ({
        id,
        name,
        group_category_id: groupCategoryId,
      }: {
        id: string
        name: string
        group_category_id: string
      }) => {
        const parsedId = `${key.toLowerCase()}-${id}`
        // if an existing override exists for this asignee, use it so we have its overrideId
        return {
          id: parsedId,
          value: name,
          groupCategoryId,
          group: I18n.t('%{groupKey}', {groupKey}),
        }
      }
    ) ?? []

  return resultParsedResult
}

export const fetchNextPages = async (
  next: {url: string},
  results: {id: string; name: string; group_category_id: string}[]
): Promise<{id: string; name: string; group_category_id: string}[]> => {
  let mergedResults = results
  const {json, link} = await doFetchApi({
    path: next.url,
  })
  mergedResults = [
    ...mergedResults,
    ...(json as {id: string; name: string; group_category_id: string}[]),
  ]
  if (link?.next) {
    mergedResults = await fetchNextPages({url: link.next.url}, mergedResults)
  }
  return mergedResults
}

export const getStudents = async ({queryKey}: {queryKey: any}) => {
  const [, currentCourseId, _currentParams] = queryKey
  const result = await getStudentsByCourse({courseId: currentCourseId})
  return result || []
}

export const getSections = async ({queryKey}: {queryKey: any}) => {
  const [, currentCourseId, currentParams] = queryKey

  const result = await doFetchApi({
    path: `/api/v1/courses/${currentCourseId}/sections`,
    params: currentParams,
  })
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  const parsedResult: AssigneeOption[] = await processResult(result, 'section', 'Sections')
  return parsedResult || []
}

export const getCourseSettings = async ({queryKey}: {queryKey: any}) => {
  const [, currentCourseId] = queryKey
  return doFetchApi({
    path: `/api/v1/courses/${currentCourseId}/settings`,
  })
}

export const getGroups = async ({queryKey}: {queryKey: any}) => {
  const [, currentGroupCategoryId, currentParams] = queryKey
  const result = await doFetchApi({
    path: `/api/v1/group_categories/${currentGroupCategoryId}/groups`,
    params: currentParams,
  })
  const parsedResult: AssigneeOption[] = await processResult(
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    result,
    'group',
    'Groups'
  )
  return parsedResult || []
}