package com.kh.workflow.common.template;

import com.kh.workflow.common.model.vo.PageInfo;

public class Pagination {

    public static PageInfo getPageInfo(
            int listCount,
            int currentPage,
            int pageLimit,
            int boardLimit) {

        return new PageInfo(
                listCount,
                currentPage,
                pageLimit,
                boardLimit
        );
    }
}