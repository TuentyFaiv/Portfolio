
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const theme: CustomThemeConfig = {
  name: 'tuentyfaiv-theme',
  properties: {
    // =~= Theme Properties =~=
    "--theme-font-family-base": "'Mulish Variable', sans-serif",
    "--theme-font-family-heading": "'Orbitron Variable', sans-serif",
    "--theme-font-color-base": "var(--color-surface-900)",
    "--theme-font-color-dark": "255 255 255",
    "--theme-rounded-base": "8px",
    "--theme-rounded-container": "8px",
    "--theme-border-base": "1px",
    // =~= Theme On-X Colors =~=
    "--on-primary": "var(--color-surface-50)",
    "--on-secondary": "var(--color-surface-900)",
    "--on-tertiary": "var(--color-surface-50)",
    "--on-success": "var(--color-surface-900)",
    "--on-warning": "var(--color-surface-900)",
    "--on-error": "255 255 255",
    "--on-surface": "255 255 255",
    // =~= Theme Colors  =~=
    // primary | #961E1E 
    "--color-primary-50": "239 221 221", // #efdddd
    "--color-primary-100": "234 210 210", // #ead2d2
    "--color-primary-200": "229 199 199", // #e5c7c7
    "--color-primary-300": "213 165 165", // #d5a5a5
    "--color-primary-400": "182 98 98", // #b66262
    "--color-primary-500": "150 30 30", // #961E1E
    "--color-primary-600": "135 27 27", // #871b1b
    "--color-primary-700": "113 23 23", // #711717
    "--color-primary-800": "90 18 18", // #5a1212
    "--color-primary-900": "74 15 15", // #4a0f0f
    // secondary | #21C08B 
    "--color-secondary-50": "222 246 238", // #def6ee
    "--color-secondary-100": "211 242 232", // #d3f2e8
    "--color-secondary-200": "200 239 226", // #c8efe2
    "--color-secondary-300": "166 230 209", // #a6e6d1
    "--color-secondary-400": "100 211 174", // #64d3ae
    "--color-secondary-500": "33 192 139", // #21C08B
    "--color-secondary-600": "30 173 125", // #1ead7d
    "--color-secondary-700": "25 144 104", // #199068
    "--color-secondary-800": "20 115 83", // #147353
    "--color-secondary-900": "16 94 68", // #105e44
    // tertiary | #6E2AB2 
    "--color-tertiary-50": "233 223 243", // #e9dff3
    "--color-tertiary-100": "226 212 240", // #e2d4f0
    "--color-tertiary-200": "219 202 236", // #dbcaec
    "--color-tertiary-300": "197 170 224", // #c5aae0
    "--color-tertiary-400": "154 106 201", // #9a6ac9
    "--color-tertiary-500": "110 42 178", // #6E2AB2
    "--color-tertiary-600": "99 38 160", // #6326a0
    "--color-tertiary-700": "83 32 134", // #532086
    "--color-tertiary-800": "66 25 107", // #42196b
    "--color-tertiary-900": "54 21 87", // #361557
    // success | #19B34C 
    "--color-success-50": "221 244 228", // #ddf4e4
    "--color-success-100": "209 240 219", // #d1f0db
    "--color-success-200": "198 236 210", // #c6ecd2
    "--color-success-300": "163 225 183", // #a3e1b7
    "--color-success-400": "94 202 130", // #5eca82
    "--color-success-500": "25 179 76", // #19B34C
    "--color-success-600": "23 161 68", // #17a144
    "--color-success-700": "19 134 57", // #138639
    "--color-success-800": "15 107 46", // #0f6b2e
    "--color-success-900": "12 88 37", // #0c5825
    // warning | #D4A516 
    "--color-warning-50": "249 242 220", // #f9f2dc
    "--color-warning-100": "246 237 208", // #f6edd0
    "--color-warning-200": "244 233 197", // #f4e9c5
    "--color-warning-300": "238 219 162", // #eedba2
    "--color-warning-400": "225 192 92", // #e1c05c
    "--color-warning-500": "212 165 22", // #D4A516
    "--color-warning-600": "191 149 20", // #bf9514
    "--color-warning-700": "159 124 17", // #9f7c11
    "--color-warning-800": "127 99 13", // #7f630d
    "--color-warning-900": "104 81 11", // #68510b
    // error | #DB2560 
    "--color-error-50": "250 222 231", // #fadee7
    "--color-error-100": "248 211 223", // #f8d3df
    "--color-error-200": "246 201 215", // #f6c9d7
    "--color-error-300": "241 168 191", // #f1a8bf
    "--color-error-400": "230 102 144", // #e66690
    "--color-error-500": "219 37 96", // #DB2560
    "--color-error-600": "197 33 86", // #c52156
    "--color-error-700": "164 28 72", // #a41c48
    "--color-error-800": "131 22 58", // #83163a
    "--color-error-900": "107 18 47", // #6b122f
    // surface | #222831 
    "--color-surface-50": "222 223 224", // #dedfe0
    "--color-surface-100": "211 212 214", // #d3d4d6
    "--color-surface-200": "200 201 204", // #c8c9cc
    "--color-surface-300": "167 169 173", // #a7a9ad
    "--color-surface-400": "100 105 111", // #64696f
    "--color-surface-500": "34 40 49", // #222831
    "--color-surface-600": "31 36 44", // #1f242c
    "--color-surface-700": "26 30 37", // #1a1e25
    "--color-surface-800": "20 24 29", // #14181d
    "--color-surface-900": "17 20 24", // #111418

  }
}