import { useCallback } from 'react';

import isArray from 'lodash/isArray';
import { useRouter } from 'next/router';

import QueryParam from '@/types/QueryParam';

const useRemoveQueryParam = () => {
  const router = useRouter();

  return useCallback(
    (queryParam: QueryParam | QueryParam[]) => {
      const nextQuery = { ...router.query };
      if (isArray(queryParam)) {
        queryParam.forEach((param) => delete nextQuery[param]);
      } else {
        delete nextQuery[queryParam];
      }
      router.replace(
        {
          pathname: router.pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );
};

export default useRemoveQueryParam;
