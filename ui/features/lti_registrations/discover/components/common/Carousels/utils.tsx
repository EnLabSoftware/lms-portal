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

import type {Badges, Product} from '../../../../../../shared/lti-apps/models/Product'

interface Settings {
  [key: string]: number | boolean | Array<number> | Object
}

export const settings = (items: string[] | Badges[] | Product[]): Settings => {
  return {
    dots: false,
    infinite: false,
    slidesToShow: items.length > 3 ? 3 : items?.length,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 760,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 360,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }
}

export const calculateArrowDisableIndex = (
  items: string[] | Badges[] | Product[],
  windowSize: number
): {type: number} => {
  const total = items.length
  if (windowSize <= 360 && total === 2) {
    return {type: total - 1}
  } else if (windowSize <= 360) {
    return {type: total - 1}
  } else if (windowSize <= 760 && windowSize > 360) {
    return {type: total - 2}
  } else if (windowSize >= 760 && total === 2) {
    return {type: total - 2}
  } else {
    return {type: total - 3}
  }
}