import { Table, createTheme } from '@mantine/core'

const theme = createTheme({
  colors: {
    accent: [
      '#fceefd',
      '#f1daf4',
      '#e0b3e6',
      '#ce89da',
      '#c066ce',
      '#b750c7',
      '#b343c5',
      '#9d36ae',
      '#8c2e9b',
      '#7b2589',
    ],
    // error: ,
  },
  primaryColor: 'accent',
  primaryShade: 7,
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
