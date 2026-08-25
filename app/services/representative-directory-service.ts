import type {
  DirectoryRepresentative,
  DirectorySearchRequest,
  DirectorySearchResponse,
} from "../domain/representative-directory";

export type RepresentativeDirectoryService = {
  getRepresentative(
    representativeId: string,
    signal?: AbortSignal,
  ): Promise<DirectoryRepresentative | null>;
  search(
    request: DirectorySearchRequest,
    signal?: AbortSignal,
  ): Promise<DirectorySearchResponse>;
};
