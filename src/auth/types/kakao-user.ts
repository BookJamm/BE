export type KakaoUser = {
  id: number;
  kakao_account: KakaoAccount;
};

type KakaoAccount = {
  profile: Profile;
};

type Profile = {
  nickname: string;
  profile_image_url: string;
};
