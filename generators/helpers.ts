export const paginateList = (list: any[], pageSize: number, pageNumber: number) => {
    const start = pageSize * pageNumber;
    const end = start + pageSize;
    return list.slice(start, end);
}