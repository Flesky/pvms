# Mantine starter project
[![code style](https://antfu.me/badge-code-style.svg)](https://github.com/antfu/eslint-config)

This is a work in progress. Will be improved upon as I learn more React.

* Vite + React + TypeScript
* Mantine + Tailwind + Tabler Icons
* Yup
* React Router
* TanStack React Query

## Built-in Components

* Header
* Datatable
    ```tsx
    import AppClientTable from "./AppClientTable";
    
    <AppClientTable
      id="id"
      tableProps={{
        records: [],
        columns: [],
      }}
    >
    </AppClientTable>
    ```