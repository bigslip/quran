import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthData from './useAuthData';
import { getLoginNavigationUrl, ROUTES } from '@/utils/navigation';
import { resolveSafeRedirect } from '@/utils/url';
import QueryParam from '@/types/QueryParam';
import { SSO_ENABLED } from '@/utils/auth/constants';

interface UseAuthRedirectReturn {
  redirectWithToken: (redirect: string, token: string) => void;
}

const useAuthRedirect = (): UseAuthRedirectReturn => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthData();

  useEffect(() => {
    if (isLoading) return;

    const isProfilePage = router.pathname === '/profile' || router.pathname.startsWith('/profile/');
    const isLoginPage = router.pathname === ROUTES.LOGIN;

    if (!isAuthenticated && isProfilePage) {
      router.replace(getLoginNavigationUrl(router.asPath));
    } else if (isAuthenticated && isLoginPage) {
      const redirect = router.query[QueryParam.REDIRECT_TO] as string;
      const destination = redirect ? resolveSafeRedirect(redirect) : '/';
      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, router]);

  const redirectWithToken = (redirect: string, token: string) => {
    if (token && SSO_ENABLED) {
      router.replace(
        `${ROUTES.AUTH}?${[QueryParam.TOKEN]}=${token}&${[QueryParam.REDIRECT_TO]}=${redirect}`,
      );
    } else {
      router.push(redirect);
    }
  };

  return { redirectWithToken };
};

export default useAuthRedirect;
