import type { Meta, StoryObj } from "@storybook/react";
import DataGrid from "../components/DataGrid/DataGrid";
import { mockValidator } from "../components/DataGrid/DataGridSchema";

const meta: Meta<typeof DataGrid> = {
  title: "DataGrid/FailureRollback",
  component: DataGrid,
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

export const RollbackOnFailure: Story = {
  args: {
    data: [{ id: 1, name: "Al", age: 22 }],
    columns: [
      { id: "id", title: "ID", width: 80 },
      { id: "name", title: "Name", width: 200, editable: true, validator: mockValidator },
      { id: "age", title: "Age", width: 100 },
    ],
  },
};