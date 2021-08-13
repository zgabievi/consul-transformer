const groups = {
	generic: [
		'Debug',
		'DefaultSupportEmail',
		'HasCookieBanner',
		'HasWelcomePage',
		'HasScrollToTop',
		'PaymentIntegration',
		'IframeZoomLevel'
	],
	seo: [
		'DefaultSeoTitle',
		'DefaultSeoDescription',
		'DefaultSeoHeading',
		'DefaultSeoKeywords',
		'DefaultSeoImage',
		'DefaultGameSeoTitle',
		'DefaultGameSeoHeading',
		'DefaultGameSeoDescription',
		'DefaultGameSeoKeywords'
	],
	game: [
		'HasPictureInPictureMode',
		'HasDemoPlay',
		'GameOpenStrategy',
		'GamePopupWidth',
		'GamePopupHeight',
		'GameCategoriesIconPosition',
		'GameItemStyle',
		'ShowGameProvider',
		'GameHasAddToFavorites',
		'GameHasPlayNowIcon',
		'TournamentsGameId'
	],
	registration: [
		'MinAgeForRegistration',
		'PageToRedirectAfterRegistration',
		'RegistrationSuccessPopupType'
	],
	user: [
		'UserCanChangeCurrency',
		'UserCanChangeEmail',
		'UserCanChangeMobile',
		'UserCanChangeAddress',
		'AdditionalDataFieldsOfUser',
		'AddressFields',
		'ExternalServices',
		'UserProfileMenuPosition',
		'HasTelephoneCode',
		'HasHighSecurity',
		'HasVoiceCallNotifications',
		'HasEmailNotifications',
		'HasSmsNotifications',
		'CanDeleteAccount'
	],
	rpg: [
		'HasResponsibleGaming',
		'PasswordExpirationDays',
		'SessionTerminationDelay',
		'NeedConfirmationToActivateSessionLimit',
		'HoursNeededForLimitActivation',
		'HoursNeededForLimitCancellation',
		'OptionsForSelfSuspensionInHours',
		'OptionsForActivityCheckInMinutes',
		'OptionsForSessionLimitationInMinutes',
		'ReservedSecondsForActivityCheck',
		'FrozenTimeOfActivityCheck',
		'HasDepositLimit',
		'HasWagerLimit',
		'HasLossLimit',
		'DepositLimitRange',
		'WagerLimitRange',
		'LossLimitRange'
	],
	providers: [
		'DocumentUploadProviderID',
		'SingularIntegrationSystemProviderID',
		'PaymentsProviderID'
	],
	themes: ['ListOfThemes', 'DefaultTheme', 'DefaultPalette'],
	kyc: ['HasKyc', 'KycSteps', 'UserShouldVerifyAddress'],
	documents: [
		'DocumentFields',
		'DocumentUploadForm',
		'SupportedDocumentTypes',
		'ListOfDocumentTypes',
		'RequiredDocumentTypes',
		'ShowPersonalIdInDocumentsList',
		'DefaultDocumentTypeId',
		'DocumentIssuingAuthoritiesByCountry',
		'MaxSizeOfDocumentImage',
		'HasDocumentIssuingAuthority',
		'HasDocumentIssuingPlace',
		'HasDocumentIssueDate',
		'KycProvider',
		'KycProviderOptions'
	],
	utm: ['UtmTtl', 'UtmMapping'],
	'transaction-history': [
		'SupportedTransactionTypes',
		'SupportedTransactionStatuses',
		'SupportedTransactionProviders',
		'TransactionHistoryFilterType'
	],
	'images-sizes': [
		'BlockSliderWidthInBothOnDesktop',
		'BlockSliderHeightInBothOnDesktop',
		'FluidSliderWidthInServerOnDesktop',
		'FluidSliderWidthInBrowserOnDesktop',
		'FluidSliderHeightInBothOnDesktop',
		'FullSliderWidthInServerOnDesktop',
		'FullSliderWidthInBrowserOnDesktop',
		'RegularGameItemWidthInBothOnDesktop',
		'RegularGameItemHeightInBothOnDesktop',
		'LargeGameItemWidthInBothOnDesktop',
		'LargeGameItemHeightInBothOnDesktop',
		'SquareGameItemWidthInBothOnDesktop',
		'SquareGameItemHeightInBothOnDesktop',
		'HorizontalGameItemWidthInBothOnDesktop',
		'HorizontalGameItemHeightInBothOnDesktop',
		'VerticalGameItemWidthInBothOnDesktop',
		'VerticalGameItemHeightInBothOnDesktop',
		'LogoWidthInBothOnDesktop',
		'LogoHeightInBothOnDesktop',
		'FooterImageHeightInBothOnDesktop',
		'BackgroundWidthInServerOnDesktop',
		'BackgroundWidthInBrowserOnDesktop',
		'CardPromotionWidthInBothOnDesktop',
		'CardPromotionHeightInBothOnDesktop',
		'DefaultPromotionWidthInBothOnDesktop',
		'DefaultPromotionHeightInBothOnDesktop',
		'BlockSliderWidthInServerOnMobile',
		'BlockSliderWidthInBrowserOnMobile',
		'FluidSliderWidthInServerOnMobile',
		'FluidSliderWidthInBrowserOnMobile',
		'FullSliderWidthInServerOnMobile',
		'FullSliderWidthInBrowserOnMobile',
		'RegularGameItemWidthInBothOnMobile',
		'RegularGameItemHeightInBothOnMobile',
		'LargeGameItemWidthInBothOnMobile',
		'LargeGameItemHeightInBothOnMobile',
		'SquareGameItemWidthInBothOnMobile',
		'SquareGameItemHeightInBothOnMobile',
		'HorizontalGameItemWidthInBothOnMobile',
		'HorizontalGameItemHeightInBothOnMobile',
		'VerticalGameItemWidthInBothOnMobile',
		'VerticalGameItemHeightInBothOnMobile',
		'LogoWidthInBothOnMobile',
		'LogoHeightInBothOnMobile',
		'FooterImageHeightInBothOnMobile',
		'BackgroundWidthInServerOnMobile',
		'BackgroundWidthInBrowserOnMobile',
		'CardPromotionWidthInBothOnMobile',
		'CardPromotionHeightInBothOnMobile',
		'DefaultPromotionWidthInBothOnMobile',
		'DefaultPromotionHeightInBothOnMobile'
	],
	'country-restrictions': ['RedirectByCountry', 'ListOfHiddenCountries'],
	header: [
		'HasIntegratedMenu',
		'DialCodeForUserIdentifier',
		'RegisterButtonOnDesktop',
		'RegisterButtonOnMobile',
		'HasLoginWithSms',
		'ShowBalanceInMobile',
		'HasLanguageSwitcher',
		'AuthenticationType',
		'HasFluidHeader',
		'HasModernAuthInfo',
		'HasPasswordEye',
		'HasFloatingAuthButtons'
	],
	'form-controls': ['UsernameCustomLabel', 'InputLabelPosition']
};

export const findInGroup = key => {
    const result = Object.entries(groups).find(([_, keys]) => keys.includes(key));

	if (!result) {
		console.error(key);
	}

    return result ? result[0] : 'generic';
};