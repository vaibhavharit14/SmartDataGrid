import type { Meta, StoryObj } from "@storybook/react";
import DataGrid from "../components/DataGrid/DataGrid";

const meta: Meta<typeof DataGrid> = {
  title: "DataGrid/Accessibility",
  component: DataGrid,
  parameters: {
    a11y: {
      element: "#root",
      manual: false,
    },
  },
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

export const ScreenReaderDemo: Story = {
  args: {
    data: [
      { id: 1, name: "Charlie", age: 28 },
      { id: 2, name: "Dana", age: 35 },
    ],
    columns: [
      { id: "id", title: "ID", width: 80 },
      { id: "name", title: "Name", width: 200, editable: true },
      { id: "age", title: "Age", width: 100, sortable: true },
    ],
  },
};