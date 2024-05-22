import { Table, createTheme } from '@mantine/core'

const theme = createTheme({
  colors: {
    accent: [
      '#e4f6ff',
      '#d1e7ff',
      '#a4cef7',
      '#72b2f1',
      '#4b9bec',
      '#318ce9',
      '#1780E7',
      '#0e72cf',
      '#0066bb',
      '#0057a6',
    ],
    green: [
      '#e6ffea',
      '#d2fbd9',
      '#a5f5b2',
      '#75ef89',
      '#4dea66',
      '#33e750',
      '#23e543',
      '#12cb35',
      '#00b42c',
      '#009c1f',
    ],
    red: [
      '#ffefe7',
      '#faded6',
      '#ecbdaf',
      '#df9a85',
      '#d37c61',
      '#cd684a',
      '#cb5e3d',
      '#b34e2f',
      '#a14429',
      '#8e381e',
    ],
  },
  primaryColor: 'accent',
  primaryShade: 6,
  components: {
    Table: Table.Th.extend({
      styles: {
        fw: 500,
      },
      defaultProps: {
        // c: 'dark.3',
        className: 'text-nowrap',
        styles: {
          fw: 500,
        },
      },
    }),
  },
})

export default theme
