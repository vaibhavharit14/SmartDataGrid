import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import DataGrid from "../components/DataGrid/DataGrid";

describe("Accessibility checks", () => {
  test("DataGrid should have no accessibility violations", async () => {
    const { container } = render(
      <DataGrid
        data={[{ id: 1, name: "Alice", age: 25 }]}
        columns={[
          { key: "id", header: "ID" },
          { key: "name", header: "Name" },
          { key: "age", header: "Age" },
        ]}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});