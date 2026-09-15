interface Reciter {
  id: number;
  reciterId?: number;
  reciter_id?: number;
  name: string;
  recitationStyle?: string;
  recitation_style?: string;
  relativePath?: string;
  relative_path?: string;
  profilePicture?: string;
  profile_picture?: string;
  coverImage?: string;
  cover_image?: string;
  bio?: string;
  qirat?: {
    languageName?: string;
    language_name?: string;
    name: string;
  };
  style?: {
    languageName?: string;
    language_name?: string;
    name: string;
    description?: string;
  };
  translatedName?: {
    languageName?: string;
    language_name?: string;
    name: string;
  };
  translated_name?: {
    languageName?: string;
    language_name?: string;
    name: string;
  };
  isAvailable?: boolean;
  is_available?: boolean;
  hasAudio?: boolean;
  has_audio?: boolean;
}
export default Reciter;
