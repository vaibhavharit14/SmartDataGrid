import { render } from "@testing-library/react";
import DataGrid from "../components/DataGrid/DataGrid";

describe("Performance checks", () => {
  const bigData = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 50),
  }));

  const sampleColumns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "age", header: "Age" },
  ];

  test("renders large dataset within time limit", () => {
    const start = performance.now();
    render(<DataGrid data={bigData} columns={sampleColumns} />);
    const end = performance.now();
    expect(end - start).toBeLessThan(200); // <200ms render time
  });
});