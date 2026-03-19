export type PopulateOptions = {
  path: string;
  select?: string;
  skip?: number;
  limit?: number;
  count?: boolean;
  sort?: string;
  pagination?: boolean;
  match?: Record<string, any>;
  populate?: {
    path: string;
    select?: string;
    match?: Record<string, any>;
  };
};

export type SearchParams = {
  query?: Record<string, any>;
  search?: {
    fields: string[];
    term: string;
  };
  populateArray?: PopulateOptions[];
  match?: Record<string, any>;
  sort?: string;
  select?: string;
  skip?: number;
  limit?: number;
  count?: boolean;
  pagination?: boolean;
  document?: boolean;
  model?: string;
  data?: string[];
  filter?: Record<string, any>;
  filters?: Array<{
    key: string;
    value: string;
  }>;
  includeArchived?: boolean;
  archivedOnly?: boolean;
};

export type MetricsOptions = {
  model?: string;
  data?: string[];
  filter?: Record<string, any>;
};

export type ArchiveOption = "none" | "include" | "only";

export class APIService {
  protected searchParams: SearchParams;

  constructor() {
    this.searchParams = {};
  }

  where(query: Record<string, any>) {
    this.searchParams.query = { ...this.searchParams.query, ...query };
    return this;
  }

  filters(filters: Array<{ key: string; value: string }>) {
    this.searchParams.filters = filters;
    if (filters && filters.length > 0) {
      const filterQuery = filters.reduce((acc, filter) => {
        acc[filter.key] = filter.value;
        return acc;
      }, {} as Record<string, string>);
      this.searchParams.query = { ...this.searchParams.query, ...filterQuery };
    }
    return this;
  }

  addFields(fields: Record<string, any>) {
    this.searchParams = { ...this.searchParams, ...fields };
    return this;
  }

  select(fields: string[] | string) {
    this.searchParams.select = Array.isArray(fields)
      ? fields.join(" ")
      : fields;
    return this;
  }

  populate(populateArray: PopulateOptions[]) {
    this.searchParams.populateArray = populateArray;
    return this;
  }

  match(match: Record<string, any>) {
    this.searchParams.match = match;
    return this;
  }

  sort(sortBy: string) {
    this.searchParams.sort = sortBy;
    return this;
  }

  limit(limit: number) {
    this.searchParams.limit = limit;
    return this;
  }

  skip(skip: number) {
    this.searchParams.skip = skip;
    return this;
  }

  withCount(count: boolean = true) {
    this.searchParams.count = count;
    return this;
  }

  withPagination(pagination: boolean = true) {
    this.searchParams.pagination = pagination;
    return this;
  }

  withDocument(document: boolean = true) {
    this.searchParams.document = document;
    return this;
  }

  withArchive(option: ArchiveOption = "none") {
    switch (option) {
      case "include":
        this.searchParams.includeArchived = true;
        this.searchParams.archivedOnly = false;
        break;
      case "only":
        this.searchParams.includeArchived = false;
        this.searchParams.archivedOnly = true;
        break;
      case "none":
      default:
        this.searchParams.includeArchived = false;
        this.searchParams.archivedOnly = false;
    }
    return this;
  }

  resetQuery() {
    this.searchParams = {};
    return this;
  }

  getSearchParams(): SearchParams {
    return this.searchParams;
  }

  getQueryString(): string {
    const params = new URLSearchParams();

    if (this.searchParams.select) {
      params.set("select", this.searchParams.select);
    }

    if (this.searchParams.limit) {
      params.set("limit", this.searchParams.limit.toString());
    }

    if (this.searchParams.populateArray) {
      params.set(
        "populateArray",
        JSON.stringify(this.searchParams.populateArray)
      );
    }

    if (this.searchParams.skip) {
      params.set("skip", this.searchParams.skip.toString());
    }

    if (this.searchParams.sort) {
      params.set("sort", this.searchParams.sort);
    }

    if (this.searchParams.document) {
      params.set("document", this.searchParams.document.toString());
    }

    if (this.searchParams.pagination) {
      params.set("pagination", this.searchParams.pagination.toString());
    }

    if (this.searchParams.model) {
      params.set("model", this.searchParams.model);
    }

    if (this.searchParams.data) {
      params.set("data", JSON.stringify(this.searchParams.data));
    }

    if (this.searchParams.filter) {
      params.set("filter", JSON.stringify(this.searchParams.filter));
    }

    if (this.searchParams.filters) {
      params.set("filters", JSON.stringify(this.searchParams.filters));
    }

    if (this.searchParams.includeArchived !== undefined) {
      params.set(
        "includeArchived",
        this.searchParams.includeArchived.toString()
      );
    }

    if (this.searchParams.archivedOnly !== undefined) {
      params.set("archivedOnly", this.searchParams.archivedOnly.toString());
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  search(fields: string[], term: string) {
    if (!term) return this;

    const searchConditions: any[] = fields.map((field) => ({
      [field]: { $regex: term, $options: "i" },
    }));

    if (fields.includes("firstName") && fields.includes("lastName")) {
      searchConditions.push({
        $expr: {
          $regexMatch: {
            input: {
              $concat: ["$firstName", " ", "$lastName"],
            },
            regex: term,
            options: "i",
          },
        },
      });
    }

    this.searchParams.query = {
      ...this.searchParams.query,
      $or: searchConditions,
    };

    return this;
  }

  metrics(options: MetricsOptions) {
    this.searchParams = {
      ...this.searchParams,
      model: options.model,
      data: options.data,
      filter: options.filter,
    };
    return this;
  }
}
