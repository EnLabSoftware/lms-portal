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
import {MockedProvider} from '@apollo/react-testing'
import {QueryProvider} from '@canvas/query'
import {QueryClientProvider} from '@tanstack/react-query'

export function MockedQueryProvider({children}) {
  return (
    <MockedProvider>
      <QueryProvider>{children}</QueryProvider>
    </MockedProvider>
  )
}

export function MockedQueryClientProvider({children, client}) {
  return (
    <MockedProvider>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </MockedProvider>
  )
}