import type { Meta, StoryObj } from "@storybook/react";
import DataGrid from "../components/DataGrid/DataGrid";

const meta: Meta<typeof DataGrid> = {
  title: "DataGrid/Basic",
  component: DataGrid,
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {
  args: {
    data: [
      { id: 1, name: "Alice", age: 25, role: "Admin" },
      { id: 2, name: "Bob", age: 30, role: "User" },
      { id: 3, name: "Charlie", age: 35, role: "Guest" },
    ],
    columns: [
      { id: "id", title: "ID", width: 80, pinned: 'left' },
      { id: "name", title: "Name", width: 200, editable: true },
      { id: "age", title: "Age", width: 100, sortable: true },
      { id: "role", title: "Role", width: 150 },
    ],
  },
};