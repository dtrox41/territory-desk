import type {
  DataReportCategory,
  DataStatusSnapshot,
} from "../domain/data-status";

export type DataStatusAccess =
  { type: "unauthorized" } | { scopeLabel: string; type: "authorized" };

export type SubmitDataReportCommand = {
  category: DataReportCategory;
  context: string;
  description: string;
  idempotencyKey: string;
  sourceVersion: string;
};

export type SubmitDataReportResult = {
  reportId: string;
  snapshot: DataStatusSnapshot;
};

export interface DataStatusService {
  getAccess(): Promise<DataStatusAccess>;
  getSnapshot(): Promise<DataStatusSnapshot>;
  submitReport(
    command: SubmitDataReportCommand,
  ): Promise<SubmitDataReportResult>;
}
