
export enum FestivalType {
  SPRING_FESTIVAL = '春节',
  MID_AUTUMN = '中秋节',
  NATIONAL_DAY = '国庆节',
  LANTERN_FESTIVAL = '元宵节',
  DRAGON_BOAT = '端午节',
  LABOR_DAY = '五一劳动节',
  NEW_YEAR = '元旦',
  ANNIVERSARY = '企业周年庆'
}

export enum TargetAudience {
  FAMILY = '家人',
  FRIENDS = '朋友',
  COLLEAGUES = '同事',
  BUSINESS_PARTNERS = '商业伙伴',
  GOVERNMENT = '政府部门/领导',
  CUSTOMERS = '广大客户'
}

export interface GreetingState {
  festival: FestivalType;
  audience: TargetAudience;
  keywords: string;
  generatedText: string;
  imageUrl: string;
  videoUrl: string;
  audioUrl: string;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
  isGeneratingAudio: boolean;
}
