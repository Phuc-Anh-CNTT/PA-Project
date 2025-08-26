import { DataTable } from "../components/DataTable";
import '../styles/resultTable.module.css'
export default function ResultTable() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full py-8 px-4">
        {/* Header */}
        <div className="mb-8 w-[95%] mx-auto">
          <h1 className="mb-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            Personnel Management System
          </h1>
          <p className="text-muted-foreground">
            Comprehensive candidate evaluation and management interface
          </p>
        </div>

        {/* Main Table */}
        <DataTable />
      </div>
    </div>
  );
}