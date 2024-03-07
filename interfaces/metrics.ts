interface MetricsRequest {
    merchantId: string[];
    transactionType?: string[];
    paymentStatus?: number[];
    createFromDate: string;
    createToDate: string;
    chartCode: string;
    scheme: string[];
}

interface MetricsResponse {
    chart: MetricsDto[];
}

interface DayMetricsResponse {
    dayGraph: DayMetricsDto[];
}

interface MetricsDto {
    metric1: number;
    metric2: number;
    metric3?: number;
    metric4?: number;
    metric5: string;
    metric6?: string;
}

interface DayMetricsDto{
    transactionsCount: number;
    transactionsAmount: number;
    averageTransactionAmount: number;
    date: string;
}