export interface MetricsRequest {
    merchantId: string[];
    transactionType?: string[];
    paymentStatus?: number[];
    createFromDate: string;
    createToDate: string;
    chartCode: string;
    scheme: string[];
}

export interface MetricsResponse {
    chart: MetricsDto[];
}

export interface DayMetricsResponse {
    dayGraph: DayMetricsDto[];
}

export interface MetricsDto {
    metric1: number;
    metric2: number;
    metric3?: number;
    metric4?: number;
    metric5: string;
    metric6?: string;
}

export interface DayMetricsDto{
    transactionsCount: number;
    transactionsAmount: number;
    averageTransactionAmount: number;
    date: string;
}