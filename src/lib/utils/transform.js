import { dotToObj } from './dot-to-obj';
import { objValueByKeyArray } from './obj-value-by-key-array';

const schema = {
	'LAYOUT.COMMON.INPUT.LABEL': 'InputLabelPosition',
	'LAYOUT.COMPONENTS.IFRAME.ZOOM_INDEX': 'IframeZoomLevel',
	'LAYOUT.COMPONENTS.PROFILE.USER_MENU_POSITION': 'UserProfileMenuPosition',
	'LAYOUT.COMPONENTS.PROFILE.TRANSACTION_HISTORY.FILTER_TYPE': 'TransactionHistoryFilterType',
	'LAYOUT.COMPONENTS.GAME_LIST.FILTER.ICON_POSITION': 'GameCategoriesIconPosition',
	'LAYOUT.COMPONENTS.GAME_LIST.ITEM.STYLE': 'GameItemStyle',
	'LAYOUT.COMPONENTS.GAME_LIST.ITEM.SHOW_PROVIDER': 'ShowGameProvider',
	'LAYOUT.COMPONENTS.GAME_LIST.ITEM.ADD_TO_FAVORITES': 'GameHasAddToFavorites',
	'LAYOUT.COMPONENTS.GAME_LIST.ITEM.PLAY_NOW_ICON': 'GameHasPlayNowIcon',
	'LAYOUT.COMPONENTS.HEADER.LOGIN_WITH_SMS_BUTTON': 'HasLoginWithSms',
	'LAYOUT.COMPONENTS.HEADER.REGISTER_BUTTON': 'RegisterButtonOnDesktop',
	'LAYOUT.COMPONENTS.HEADER.REGISTER_BUTTON_MOBILE': 'RegisterButtonOnMobile',
	'LAYOUT.COMPONENTS.HEADER.MENU_INTEGRATED': 'HasIntegratedMenu',
	'LAYOUT.COMPONENTS.HEADER.AUTH_FORM_TYPE': 'AuthenticationType',
	'LAYOUT.COMPONENTS.HEADER.LANGUAGE_SWITCHER': 'HasLanguageSwitcher',
	'LAYOUT.COMPONENTS.HEADER.MOBILE_HEADER_BALANCE': 'ShowBalanceInMobile',
	'LAYOUT.COMPONENTS.HEADER.FULL_WIDTH': 'HasFluidHeader',
	'LAYOUT.COMPONENTS.HEADER.MODERN_AUTH_INFO': 'HasModernAuthInfo',
	'LAYOUT.COMPONENTS.HEADER.FLOATING_AUTH_FORM': 'HasFloatingAuthButtons',
	'LAYOUT.COMPONENTS.HEADER.PASSWORD_VISIBILITY_BUTTON': 'HasPasswordEye',
	'LAYOUT.COMPONENTS.HEADER.AUTH_INPUT_LABEL': 'UsernameCustomLabel',
	'LAYOUT.COMPONENTS.PROFILE.ACCOUNT_MANAGEMENT.CAN_DELETE_ACCOUNT': 'CanDeleteAccount',
	'SEO.DEFAULT_HEADING': 'DefaultSeoHeading',
	'SEO.DEFAULT_KEYWORDS': 'DefaultSeoKeywords',
	'SEO.DEFAULT_TITLE': 'DefaultSeoTitle',
	'SEO.DEFAULT_IMAGE': 'DefaultSeoImage',
	'SEO.DEFAULT_DESCRIPTION': 'DefaultSeoDescription',
	'LAYOUT.IMAGE_SIZES.DESKTOP.BLOCK_SLIDER_WIDTH_BOTH': 'BlockSliderWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.BLOCK_SLIDER_HEIGHT_BOTH': 'BlockSliderHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.FLUID_SLIDER_WIDTH_SERVER': 'FluidSliderWidthInServerOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.FLUID_SLIDER_WIDTH_BROWSER': 'FluidSliderWidthInBrowserOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.FLUID_SLIDER_HEIGHT_BOTH': 'FluidSliderHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.FULL_SLIDER_WIDTH_SERVER': 'FullSliderWidthInServerOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.FULL_SLIDER_WIDTH_BROWSER': 'FullSliderWidthInBrowserOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.REGULAR_GAME_ITEM_WIDTH_BOTH': 'RegularGameItemWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.REGULAR_GAME_ITEM_HEIGHT_BOTH':
		'RegularGameItemHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.LARGE_GAME_ITEM_WIDTH_BOTH': 'LargeGameItemWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.LARGE_GAME_ITEM_HEIGHT_BOTH': 'LargeGameItemHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.SQUARE_GAME_ITEM_WIDTH_BOTH': 'SquareGameItemWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.SQUARE_GAME_ITEM_HEIGHT_BOTH': 'SquareGameItemHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.HORIZONTAL_GAME_ITEM_WIDTH_BOTH':
		'HorizontalGameItemWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.HORIZONTAL_GAME_ITEM_HEIGHT_BOTH':
		'HorizontalGameItemHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.VERTICAL_GAME_ITEM_WIDTH_BOTH':
		'VerticalGameItemWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.VERTICAL_GAME_ITEM_HEIGHT_BOTH':
		'VerticalGameItemHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.ANY_LOGO_WIDTH_BOTH': 'LogoWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.ANY_LOGO_HEIGHT_BOTH': 'LogoHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.ANY_FOOTER_IMAGE_HEIGHT_BOTH': 'FooterImageHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.ANY_BACKGROUND_WIDTH_SERVER': 'BackgroundWidthInServerOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.ANY_BACKGROUND_WIDTH_BROWSER': 'BackgroundWidthInBrowserOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.CARD_PROMOTION_WIDTH_BOTH': 'CardPromotionWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.CARD_PROMOTION_HEIGHT_BOTH': 'CardPromotionHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.DEFAULT_PROMOTION_WIDTH_BOTH': 'DefaultPromotionWidthInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.DESKTOP.DEFAULT_PROMOTION_HEIGHT_BOTH':
		'DefaultPromotionHeightInBothOnDesktop',
	'LAYOUT.IMAGE_SIZES.MOBILE.BLOCK_SLIDER_WIDTH_SERVER': 'BlockSliderWidthInServerOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.BLOCK_SLIDER_WIDTH_BROWSER': 'BlockSliderWidthInBrowserOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.FLUID_SLIDER_WIDTH_SERVER': 'FluidSliderWidthInServerOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.FLUID_SLIDER_WIDTH_BROWSER': 'FluidSliderWidthInBrowserOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.FULL_SLIDER_WIDTH_SERVER': 'FullSliderWidthInServerOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.FULL_SLIDER_WIDTH_BROWSER': 'FullSliderWidthInBrowserOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.REGULAR_GAME_ITEM_WIDTH_BOTH': 'RegularGameItemWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.REGULAR_GAME_ITEM_HEIGHT_BOTH': 'RegularGameItemHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.LARGE_GAME_ITEM_WIDTH_BOTH': 'LargeGameItemWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.LARGE_GAME_ITEM_HEIGHT_BOTH': 'LargeGameItemHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.SQUARE_GAME_ITEM_WIDTH_BOTH': 'SquareGameItemWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.SQUARE_GAME_ITEM_HEIGHT_BOTH': 'SquareGameItemHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.HORIZONTAL_GAME_ITEM_WIDTH_BOTH':
		'HorizontalGameItemWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.HORIZONTAL_GAME_ITEM_HEIGHT_BOTH':
		'HorizontalGameItemHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.VERTICAL_GAME_ITEM_WIDTH_BOTH': 'VerticalGameItemWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.VERTICAL_GAME_ITEM_HEIGHT_BOTH':
		'VerticalGameItemHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.ANY_LOGO_WIDTH_BOTH': 'LogoWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.ANY_LOGO_HEIGHT_BOTH': 'LogoHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.ANY_FOOTER_IMAGE_HEIGHT_BOTH': 'FooterImageHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.ANY_BACKGROUND_WIDTH_SERVER': 'BackgroundWidthInServerOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.ANY_BACKGROUND_WIDTH_BROWSER': 'BackgroundWidthInBrowserOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.CARD_PROMOTION_WIDTH_BOTH': 'CardPromotionWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.CARD_PROMOTION_HEIGHT_BOTH': 'CardPromotionHeightInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.DEFAULT_PROMOTION_WIDTH_BOTH': 'DefaultPromotionWidthInBothOnMobile',
	'LAYOUT.IMAGE_SIZES.MOBILE.DEFAULT_PROMOTION_HEIGHT_BOTH': 'DefaultPromotionHeightInBothOnMobile',
	HAS_PICTURE_IN_PICTURE_MODE: 'HasPictureInPictureMode',
	USER_CAN_CHANGE_CURRENCY: 'UserCanChangeCurrency',
	'LIMITS.HAS_RESPONSIBLE_GAMBLING': 'HasResponsibleGaming',
	DOCUMENT_ISSUING_AUTHORITY_IN_NEW_DOCUMENT: 'HasDocumentIssuingAuthority',
	DOCUMENT_ISSUING_PLACE_IN_NEW_DOCUMENT: 'HasDocumentIssuingPlace',
	DOCUMENT_ISSUE_DATE_IN_NEW_DOCUMENT: 'HasDocumentIssueDate',
	EXTERNAL_SERVICES: 'ExternalServices',
	SUPPORT_EMAIL: 'DefaultSupportEmail',
	HAS_DEMO_PLAY: 'HasDemoPlay',
	HAS_COOKIE_BANNER: 'HasCookieBanner',
	HAS_WELCOME_PAGE: 'HasWelcomePage',
	SCROLL_TO_TOP: 'HasScrollToTop',
	TOURNAMENTS_GAME_ID: 'TournamentsGameId',
	REGISTRATION_MIN_AGE: 'MinAgeForRegistration',
	PAYMENT_INTEGRATION: 'PaymentIntegration',
	'REGISTRATION.KYC_POPUP': 'HasKycPopup',
	'REGISTRATION.SHOW_SUCCESS_POPUP_BUTTON': 'ShowDepositButtonInRegistrationSuccessPopup',
	'REGISTRATION.REDIRECT_AFTER_LOGIN_URL': 'PageToRedirectAfterRegistration',
	DEFAULT_COUNTRY_DIAL_IN: 'DialCodeForUserIdentifier',
	PASSWORD_EXPIRATION_DAYS: 'PasswordExpirationDays',
	SESSION_EXPIRATION_TIME: 'SessionTerminationDelay',
	RESTRICTED_SESSION_LIMIT: 'NeedConfirmationToActivateSessionLimit',
	KYC_PROVIDER: 'KycProvider',
	'PROVIDERS.JUMIO.PROVIDER_ID': 'KycProviderOptions.Jumio.ProviderId',
	'PROVIDERS.JUMIO.WORKFLOW_ID': 'KycProviderOptions.Jumio.WorkflowId',
	'PROVIDERS.JUMIO.LOCALE_MAP': 'KycProviderOptions.Jumio.LocaleMap',
	REDIRECT_BY_COUNTRY: 'RedirectByCountry',
	DOCUMENT_ISSUING_AUTHORITIES: 'DocumentIssuingAuthoritiesByCountry',
	'LIMITS.LIMIT_ACTIVATION_TIME': 'HoursNeededForLimitActivation',
	'LIMITS.LIMIT_CANCELATION_TIME': 'HoursNeededForLimitCancellation',
	'LIMITS.SELF_SUSPEND_TIMES': 'OptionsForSelfSuspensionInHours',
	'LIMITS.ACTIVITY_CHECK_TIMES': 'OptionsForActivityCheckInMinutes',
	'LIMITS.SESSION_LIMITATION_TIMES': 'OptionsForSessionLimitationInMinutes',
	'LIMITS.ACTIVITY_CHECK_DIFF_TIME': 'ReservedSecondsForActivityCheck',
	'GAME.OPEN_STRATEGY': 'GameOpenStrategy',
	'GAME.POPUP_WIDTH': 'GamePopupWidth',
	'GAME.POPUP_HEIGHT': 'GamePopupHeight',
	'SERVICES.UFG': 'UserFavoriteGamesProviderID',
	'SERVICES.RPG': 'RecentlyPlayedGamesProviderID',
	'SERVICES.DOC': 'DocumentUploadProviderID',
	'SERVICES.SIS': 'SingularIntegrationSystemProviderID',
	'SERVICES.PAY': 'PaymentsProviderID',
	'THEMES.LIST': 'ListOfThemes',
	'THEMES.DEFAULT': 'DefaultTheme',
	'THEMES.PALETTE': 'DefaultPalette',
	'TRANSACTION_HISTORY.SUPPORTED_TYPES': 'SupportedTransactionTypes',
	'TRANSACTION_HISTORY.SUPPORTED_STATUSES': 'SupportedTransactionStatuses',
	'TRANSACTION_HISTORY.SUPPORTED_PROVIDERS': 'SupportedTransactionProviders',
	'UTM.TTL': 'UtmTtl',
	'UTM.MAPPING': 'UtmMapping',
	'CORE_DOCUMENT.DEFAULT_TYPE': 'DefaultDocumentTypeId',
	HIDDEN_COUNTRIES: 'ListOfHiddenCountries',
	DEBUG: 'Debug',
	USER_CAN_CHANGE_EMAIL: 'UserCanChangeEmail',
	USER_CAN_CHANGE_MOBILE: 'UserCanChangeMobile',
	USER_CAN_CHANGE_ADDRESS: 'UserCanChangeAddress',
	'REGISTRATION.SHOULD_VERIFY_ADDRESS': 'UserShouldVerifyAddress',
	HAS_VOICE_CALL_NOTIFICATIONS: 'HasVoiceCallNotifications',
	HAS_EMAIL_NOTIFICATIONS: 'HasEmailNotifications',
	HAS_SMS_NOTIFICATIONS: 'HasSmsNotifications',
	'LIMITS.SINGLE_ACTIVITY_CHECK_TIME': 'FrozenTimeOfActivityCheck',
	HAS_TELEPHONE_CODE: 'HasTelephoneCode',
	HAS_HIGH_SECURITY: 'HasHighSecurity',
	'LIMITS.HAS_DEPOSIT_LIMIT': 'HasDepositLimit',
	'LIMITS.HAS_WAGER_LIMIT': 'HasWagerLimit',
	'LIMITS.HAS_LOSS_LIMIT': 'HasLossLimit',
	'LIMITS.DEPOSIT_LIMIT_RANGE': 'DepositLimitRange',
	'LIMITS.WAGER_LIMIT_RANGE': 'WagerLimitRange',
	'LIMITS.LOSS_LIMIT_RANGE': 'LossLimitRange',
	'CORE_DOCUMENT.FIELDS': 'DocumentFields',
	'CORE_DOCUMENT.UPLOAD_FORM': 'DocumentUploadForm',
	'CORE_DOCUMENT.SUPPORTED_TYPES': 'SupportedDocumentTypes',
	'CORE_DOCUMENT.TYPES': 'ListOfDocumentTypes',
	'CORE_DOCUMENT.REQUIRED_TYPES': 'RequiredDocumentTypes',
	USER_ADDITIONAL_DATA_FIELDS: 'AdditionalDataFieldsOfUser',
	'REGISTRATION.KYC_STEPS': 'KycSteps',
	USER_ADDRESS_FIELDS: 'AddressFields'
};

export const transform = (obj) => {
	const workObj = dotToObj(JSON.parse(obj));
	const newObj = {};
	const missingKeys = [];

	Object.entries(schema).forEach(([dottedKey, newKey]) => {
		const objNesting = dottedKey.split('.');
		const value = objValueByKeyArray(workObj, objNesting);

		if (value !== undefined) {
			if (newKey === 'DocumentFields') {
				newObj[newKey] = transformDocumentFields(value);
			} else if (newKey === 'DocumentUploadForm') {
				newObj[newKey] = transformDocumentUploadForm(value);
			} else {
				newObj[newKey] = value;
			}
		} else {
			missingKeys.push({ oldKey: dottedKey, newKey });
		}
	});

	return {
		result: newObj,
		missingKeys
	};
};

function transformDocumentFields(value) {
	const transformedValue = {};

	Object.entries(value).forEach(([docType, fields]) => {
		const fieldObj = {};

		if ('HAS_ID' in fields) {
			fieldObj.HasId = fields.HAS_ID;
		}

		if ('HAS_NUMBER' in fields) {
			fieldObj.HasNumber = fields.HAS_NUMBER;
		}

		if ('INPUT_LABEL' in fields) {
			fieldObj.InputLabel = fields.INPUT_LABEL;
		}

		if ('ACCEPTED_FILE_TYPES' in fields) {
			fieldObj.AcceptedFileTypes = fields.ACCEPTED_FILE_TYPES;
		}

		transformedValue[docType] = fieldObj;
	});

	return transformedValue;
}

function transformDocumentUploadForm(value) {
	const transformedValue = {};

	Object.entries(value).forEach(([docType, { IMAGES }]) => {
		const imagesArr = IMAGES.map((image) => {
			const newImg = {};

			if ('TYPE' in image) {
				newImg.type = image.TYPE;
			}

			if ('LABEL' in image) {
				newImg.label = image.LABEL;
			}

			if ('REQUIRED' in image) {
				newImg.required = image.ACCEPTED_FILE_TYPES;
			}

			return newImg;
		});

		transformedValue[docType] = {
			images: imagesArr
		};
	});

	return transformedValue;
}
