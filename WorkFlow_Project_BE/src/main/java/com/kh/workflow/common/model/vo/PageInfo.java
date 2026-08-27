package com.kh.workflow.common.model.vo;

public class PageInfo {

    private int listCount;       // 전체 게시글 수
    private int currentPage;     // 현재 페이지
    private int pageLimit;       // 페이지 버튼 수
    private int boardLimit;      // 한 페이지 게시글 수

    private int maxPage;
    private int startPage;
    private int endPage;

    public PageInfo() {
    }

    public PageInfo(int listCount, int currentPage,
                    int pageLimit, int boardLimit,
                    int maxPage, int statrPage, int endPage) {

        this.listCount = listCount;
        this.currentPage = currentPage;
        this.pageLimit = pageLimit;
        this.boardLimit = boardLimit;

        this.maxPage =
                (int)Math.ceil((double)listCount / boardLimit);

        this.startPage =
                ((currentPage - 1) / pageLimit) * pageLimit + 1;

        this.endPage =
                startPage + pageLimit - 1;

        if (endPage > maxPage) {
            endPage = maxPage;
        }
    }

    public int getListCount() {
        return listCount;
    }

    public void setListCount(int listCount) {
        this.listCount = listCount;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageLimit() {
        return pageLimit;
    }

    public void setPageLimit(int pageLimit) {
        this.pageLimit = pageLimit;
    }

    public int getBoardLimit() {
        return boardLimit;
    }
    
    public int getOffset() {
        return (currentPage - 1) * boardLimit;
    }

    public int getLimit() {
        return boardLimit;
    }

    public void setBoardLimit(int boardLimit) {
        this.boardLimit = boardLimit;
    }

    public int getMaxPage() {
        return maxPage;
    }

    public void setMaxPage(int maxPage) {
        this.maxPage = maxPage;
    }

    public int getStartPage() {
        return startPage;
    }

    public void setStartPage(int startPage) {
        this.startPage = startPage;
    }

    public int getEndPage() {
        return endPage;
    }

    public void setEndPage(int endPage) {
        this.endPage = endPage;
    }

    @Override
    public String toString() {
        return "PageInfo [listCount=" + listCount
                + ", currentPage=" + currentPage
                + ", pageLimit=" + pageLimit
                + ", boardLimit=" + boardLimit
                + ", maxPage=" + maxPage
                + ", startPage=" + startPage
                + ", endPage=" + endPage + "]";
    }
}