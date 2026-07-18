import type { LanguageCode, ReplyButton } from "./types";
import type { ReplyList, ReplyListRow } from "./whatsapp/sender";

type CopyKey =
  | "welcome"
  | "chooseRole"
  | "buyerSoon"
  | "verifyPrompt"
  | "verified"
  | "sendProduct"
  | "verifyAgain"
  | "voiceFailed"
  | "injection"
  | "selfHarm"
  | "reset"
  | "edit"
  | "needTitle"
  | "needPrice"
  | "needQuantity"
  | "listingSaved"
  | "tryAgain";

const copy: Record<LanguageCode, Record<CopyKey, string>> = {
  "en-IN": {
    welcome: "Welcome to SellThat! Which language would you like to use?",
    chooseRole: "Are you a seller or a buyer?",
    buyerSoon: "Buying is coming soon 🙏 For now, sellers can list products here. Type seller whenever you want to sell.",
    verifyPrompt: "Sellers join our free community to learn to sell. Join here: {communityLink}\n\nOnce you are in, tap Verify me.",
    verified: "You're verified! ✅ Send a photo of your product and tell me about it. You can type or send a voice note.",
    sendProduct: "Please send a photo or tell me about the product you want to list.",
    verifyAgain: "Please join the community and tap Verify me when you are ready.",
    voiceFailed: "I couldn't hear that clearly. Please type it or send the voice note again.",
    injection: "I can help you list a product. Please tell me about what you want to sell.",
    selfHarm: "I'm really sorry you're feeling this way. Please contact local emergency services or someone you trust right now. You deserve immediate support.",
    reset: "Okay, I cleared this draft. Send details for the product you want to list.",
    edit: "Of course. Tell me whether you want to change the price or quantity, and send the new number.",
    needTitle: "What product would you like to list?",
    needPrice: "What is the price per piece?",
    needQuantity: "How many do you have?",
    listingSaved: "I saved those details. Please tell me the remaining information.",
    tryAgain: "Please tell me a little more about the product so I can prepare your listing.",
  },
  "hi-IN": {
    welcome: "SellThat में आपका स्वागत है! आप कौन-सी भाषा इस्तेमाल करना चाहेंगे?",
    chooseRole: "क्या आप विक्रेता हैं या खरीदार?",
    buyerSoon: "खरीदारी जल्द शुरू होगी 🙏 अभी विक्रेता यहाँ अपना सामान सूचीबद्ध कर सकते हैं। बेचने के लिए कभी भी seller लिखें।",
    verifyPrompt: "विक्रेता बेचने के तरीके सीखने के लिए हमारे मुफ्त समुदाय से जुड़ते हैं। यहाँ जुड़ें: {communityLink}\n\nजुड़ने के बाद Verify me दबाएँ।",
    verified: "आप सत्यापित हो गए हैं! ✅ अपने उत्पाद की फोटो भेजें और उसके बारे में बताएं। आप लिख सकते हैं या वॉइस नोट भेज सकते हैं।",
    sendProduct: "कृपया फोटो भेजें या उस उत्पाद के बारे में बताएं जिसे आप सूचीबद्ध करना चाहते हैं।",
    verifyAgain: "कृपया समुदाय से जुड़ें और तैयार होने पर Verify me दबाएँ।",
    voiceFailed: "मैं वह आवाज़ साफ़ नहीं सुन पाया। कृपया लिखें या वॉइस नोट फिर से भेजें।",
    injection: "मैं आपका उत्पाद सूचीबद्ध करने में मदद कर सकता हूँ। कृपया बताएं कि आप क्या बेचना चाहते हैं।",
    selfHarm: "मुझे दुख है कि आप ऐसा महसूस कर रहे हैं। कृपया अभी स्थानीय आपातकालीन सेवा या किसी भरोसेमंद व्यक्ति से संपर्क करें। आपको तुरंत सहारे की ज़रूरत है।",
    reset: "ठीक है, मैंने यह ड्राफ्ट साफ़ कर दिया। जिस उत्पाद को सूचीबद्ध करना है उसकी जानकारी भेजें।",
    edit: "ज़रूर। बताएं कि कीमत बदलनी है या मात्रा, और नया नंबर लिखें।",
    needTitle: "आप कौन-सा उत्पाद सूचीबद्ध करना चाहते हैं?",
    needPrice: "एक पीस की कीमत क्या है?",
    needQuantity: "आपके पास कितने हैं?",
    listingSaved: "मैंने ये जानकारी सहेज ली है। कृपया बाकी जानकारी बताएं।",
    tryAgain: "कृपया उत्पाद के बारे में थोड़ा और बताएं ताकि मैं आपकी सूची तैयार कर सकूँ।",
  },
  "bn-IN": {
    welcome: "SellThat-এ স্বাগতম! আপনি কোন ভাষা ব্যবহার করতে চান?",
    chooseRole: "আপনি বিক্রেতা না ক্রেতা?",
    buyerSoon: "কেনাকাটা শিগগিরই আসছে 🙏 এখন বিক্রেতারা এখানে পণ্য তালিকাভুক্ত করতে পারেন। বিক্রি করতে চাইলে seller লিখুন।",
    verifyPrompt: "বিক্রেতারা বিক্রি শিখতে আমাদের বিনামূল্যের কমিউনিটিতে যোগ দেন। এখানে যোগ দিন: {communityLink}\n\nযোগ দেওয়ার পরে Verify me চাপুন।",
    verified: "আপনি যাচাইকৃত! ✅ পণ্যের ছবি পাঠান এবং এটি সম্পর্কে বলুন। লিখতে বা ভয়েস নোট পাঠাতে পারেন।",
    sendProduct: "অনুগ্রহ করে ছবি পাঠান বা যে পণ্যটি তালিকাভুক্ত করতে চান তার সম্পর্কে বলুন।",
    verifyAgain: "অনুগ্রহ করে কমিউনিটিতে যোগ দিয়ে প্রস্তুত হলে Verify me চাপুন।",
    voiceFailed: "আমি কথাটি পরিষ্কার শুনতে পারিনি। অনুগ্রহ করে লিখুন বা আবার ভয়েস নোট পাঠান।",
    injection: "আমি আপনার পণ্য তালিকাভুক্ত করতে সাহায্য করতে পারি। আপনি কী বিক্রি করতে চান বলুন।",
    selfHarm: "আপনি এমন অনুভব করছেন শুনে আমি দুঃখিত। অনুগ্রহ করে এখনই স্থানীয় জরুরি পরিষেবা বা বিশ্বাসযোগ্য কারও সঙ্গে যোগাযোগ করুন।",
    reset: "ঠিক আছে, আমি এই খসড়াটি মুছে দিয়েছি। যে পণ্যটি তালিকাভুক্ত করতে চান তার তথ্য পাঠান।",
    edit: "অবশ্যই। দাম না পরিমাণ বদলাতে চান বলুন এবং নতুন সংখ্যাটি লিখুন।",
    needTitle: "আপনি কোন পণ্য তালিকাভুক্ত করতে চান?",
    needPrice: "প্রতি পিসের দাম কত?",
    needQuantity: "আপনার কাছে কতটি আছে?",
    listingSaved: "আমি এই তথ্য সংরক্ষণ করেছি। বাকি তথ্য বলুন।",
    tryAgain: "অনুগ্রহ করে পণ্য সম্পর্কে একটু বেশি বলুন যাতে আমি তালিকাটি তৈরি করতে পারি।",
  },
  "te-IN": {
    welcome: "SellThatకి స్వాగతం! మీరు ఏ భాషను ఉపయోగించాలనుకుంటున్నారు?",
    chooseRole: "మీరు అమ్మకందారులా లేదా కొనుగోలుదారులా?",
    buyerSoon: "కొనుగోలు త్వరలో ప్రారంభమవుతుంది 🙏 ప్రస్తుతం అమ్మకందారులు ఇక్కడ ఉత్పత్తులను జాబితా చేయవచ్చు. అమ్మడానికి ఎప్పుడైనా seller అని టైప్ చేయండి।",
    verifyPrompt: "అమ్మకందారులు అమ్మడం నేర్చుకోవడానికి మా ఉచిత కమ్యూనిటీలో చేరతారు. ఇక్కడ చేరండి: {communityLink}\n\nచేరిన తర్వాత Verify me నొక్కండి।",
    verified: "మీరు ధృవీకరించబడ్డారు! ✅ మీ ఉత్పత్తి ఫోటో పంపి దాని గురించి చెప్పండి. టైప్ చేయవచ్చు లేదా వాయిస్ నోట్ పంపవచ్చు।",
    sendProduct: "దయచేసి ఫోటో పంపండి లేదా మీరు జాబితా చేయాలనుకున్న ఉత్పత్తి గురించి చెప్పండి।",
    verifyAgain: "దయచేసి కమ్యూనిటీలో చేరి సిద్ధమైనప్పుడు Verify me నొక్కండి।",
    voiceFailed: "నేను అది స్పష్టంగా వినలేకపోయాను. దయచేసి టైప్ చేయండి లేదా వాయిస్ నోట్ మళ్లీ పంపండి।",
    injection: "మీ ఉత్పత్తిని జాబితా చేయడంలో నేను సహాయం చేస్తాను. మీరు ఏమి అమ్మాలనుకుంటున్నారో చెప్పండి।",
    selfHarm: "మీరు ఇలా భావిస్తున్నారని విని బాధగా ఉంది. దయచేసి వెంటనే స్థానిక అత్యవసర సేవలను లేదా నమ్మకమైన వ్యక్తిని సంప్రదించండి।",
    reset: "సరే, ఈ డ్రాఫ్ట్‌ను తొలగించాను. జాబితా చేయాలనుకున్న ఉత్పత్తి వివరాలు పంపండి।",
    edit: "తప్పకుండా. ధర లేదా పరిమాణం ఏది మార్చాలనుకుంటున్నారో చెప్పి, కొత్త సంఖ్య పంపండి।",
    needTitle: "మీరు ఏ ఉత్పత్తిని జాబితా చేయాలనుకుంటున్నారు?",
    needPrice: "ఒక్కో దాని ధర ఎంత?",
    needQuantity: "మీ వద్ద ఎన్ని ఉన్నాయి?",
    listingSaved: "ఈ వివరాలను సేవ్ చేశాను. మిగిలిన సమాచారం చెప్పండి।",
    tryAgain: "మీ జాబితాను తయారు చేయడానికి ఉత్పత్తి గురించి కొంచెం ఎక్కువ చెప్పండి।",
  },
  "mr-IN": {
    welcome: "SellThat मध्ये स्वागत आहे! तुम्हाला कोणती भाषा वापरायची आहे?",
    chooseRole: "तुम्ही विक्रेता आहात की खरेदीदार?",
    buyerSoon: "खरेदी लवकरच सुरू होईल 🙏 सध्या विक्रेते येथे उत्पादने सूचीबद्ध करू शकतात. विकण्यासाठी कधीही seller लिहा।",
    verifyPrompt: "विक्रेते विक्री शिकण्यासाठी आमच्या मोफत समुदायात सामील होतात. येथे सामील व्हा: {communityLink}\n\nसामील झाल्यावर Verify me दाबा।",
    verified: "तुमचे सत्यापन झाले आहे! ✅ उत्पादनाचा फोटो पाठवा आणि त्याबद्दल सांगा. तुम्ही लिहू शकता किंवा व्हॉइस नोट पाठवू शकता।",
    sendProduct: "कृपया फोटो पाठवा किंवा ज्या उत्पादनाची यादी करायची आहे त्याबद्दल सांगा।",
    verifyAgain: "कृपया समुदायात सामील व्हा आणि तयार झाल्यावर Verify me दाबा।",
    voiceFailed: "मला ते स्पष्ट ऐकू आले नाही. कृपया टाइप करा किंवा व्हॉइस नोट पुन्हा पाठवा।",
    injection: "मी तुमचे उत्पादन सूचीबद्ध करण्यात मदत करू शकतो. तुम्हाला काय विकायचे आहे ते सांगा।",
    selfHarm: "तुम्हाला असे वाटत आहे हे ऐकून मला वाईट वाटले. कृपया लगेच स्थानिक आपत्कालीन सेवेशी किंवा विश्वासू व्यक्तीशी संपर्क करा।",
    reset: "ठीक आहे, मी हा मसुदा साफ केला आहे. यादी करायच्या उत्पादनाची माहिती पाठवा।",
    edit: "नक्की. किंमत की प्रमाण बदलायचे ते सांगा आणि नवीन अंक पाठवा।",
    needTitle: "तुम्हाला कोणते उत्पादन सूचीबद्ध करायचे आहे?",
    needPrice: "प्रति नग किंमत किती आहे?",
    needQuantity: "तुमच्याकडे किती आहेत?",
    listingSaved: "मी ही माहिती जतन केली आहे. उरलेली माहिती सांगा।",
    tryAgain: "तुमची यादी तयार करण्यासाठी उत्पादनाबद्दल थोडी अधिक माहिती सांगा।",
  },
  "ta-IN": {
    welcome: "SellThat-க்கு வரவேற்கிறோம்! நீங்கள் எந்த மொழியைப் பயன்படுத்த விரும்புகிறீர்கள்?",
    chooseRole: "நீங்கள் விற்பனையாளரா அல்லது வாங்குபவரா?",
    buyerSoon: "வாங்குதல் விரைவில் வருகிறது 🙏 இப்போது விற்பனையாளர்கள் இங்கே பொருட்களை பட்டியலிடலாம். விற்க seller என்று எழுதுங்கள்।",
    verifyPrompt: "விற்பனையாளர்கள் விற்க கற்க எங்கள் இலவச சமூகத்தில் சேர்கிறார்கள். இங்கே சேருங்கள்: {communityLink}\n\nசேர்ந்த பின் Verify me அழுத்துங்கள்।",
    verified: "நீங்கள் சரிபார்க்கப்பட்டுள்ளீர்கள்! ✅ உங்கள் பொருளின் புகைப்படத்தை அனுப்பி அதைப் பற்றி சொல்லுங்கள். தட்டச்சு செய்யலாம் அல்லது குரல் குறிப்பை அனுப்பலாம்।",
    sendProduct: "தயவுசெய்து புகைப்படம் அனுப்புங்கள் அல்லது பட்டியலிட விரும்பும் பொருளைப் பற்றி சொல்லுங்கள்।",
    verifyAgain: "தயவுசெய்து சமூகத்தில் சேர்ந்து தயாரானதும் Verify me அழுத்துங்கள்।",
    voiceFailed: "என்னால் அதைத் தெளிவாகக் கேட்க முடியவில்லை. தயவுசெய்து தட்டச்சு செய்யுங்கள் அல்லது குரல் குறிப்பை மீண்டும் அனுப்புங்கள்।",
    injection: "உங்கள் பொருளைப் பட்டியலிட நான் உதவ முடியும். நீங்கள் எதை விற்க விரும்புகிறீர்கள் என்று சொல்லுங்கள்।",
    selfHarm: "நீங்கள் இப்படிச் உணர்வது வருத்தமாக உள்ளது. தயவுசெய்து இப்போதே உள்ளூர் அவசர சேவையையோ நம்பகமான ஒருவரையோ தொடர்பு கொள்ளுங்கள்।",
    reset: "சரி, இந்த வரைவை நீக்கிவிட்டேன். பட்டியலிட விரும்பும் பொருளின் விவரங்களை அனுப்புங்கள்।",
    edit: "நிச்சயமாக. விலையையா அளவையா மாற்ற விரும்புகிறீர்கள் என்று சொல்லி, புதிய எண்ணை அனுப்புங்கள்।",
    needTitle: "நீங்கள் எந்தப் பொருளைப் பட்டியலிட விரும்புகிறீர்கள்?",
    needPrice: "ஒன்றின் விலை என்ன?",
    needQuantity: "உங்களிடம் எத்தனை உள்ளன?",
    listingSaved: "இந்த விவரங்களைச் சேமித்துள்ளேன். மீதமுள்ள தகவலைச் சொல்லுங்கள்।",
    tryAgain: "உங்கள் பட்டியலை உருவாக்க பொருளைப் பற்றி இன்னும் கொஞ்சம் சொல்லுங்கள்।",
  },
  "gu-IN": {
    welcome: "SellThat માં આપનું સ્વાગત છે! તમે કઈ ભાષા વાપરવા માંગો છો?",
    chooseRole: "તમે વેચનાર છો કે ખરીદદાર?",
    buyerSoon: "ખરીદી ટૂંક સમયમાં આવશે 🙏 હાલ વેચનાર અહીં ઉત્પાદનો સૂચિબદ્ધ કરી શકે છે. વેચવા માટે ક્યારે પણ seller લખો।",
    verifyPrompt: "વેચનાર વેચતા શીખવા માટે અમારા મફત સમુદાયમાં જોડાય છે. અહીં જોડાઓ: {communityLink}\n\nજોડાયા પછી Verify me દબાવો।",
    verified: "તમારી ચકાસણી થઈ ગઈ છે! ✅ તમારા ઉત્પાદનનો ફોટો મોકલો અને તેના વિશે કહો. તમે લખી શકો છો અથવા વૉઇસ નોટ મોકલી શકો છો।",
    sendProduct: "કૃપા કરીને ફોટો મોકલો અથવા જે ઉત્પાદન સૂચિબદ્ધ કરવું હોય તેના વિશે કહો।",
    verifyAgain: "કૃપા કરીને સમુદાયમાં જોડાઓ અને તૈયાર થાઓ ત્યારે Verify me દબાવો।",
    voiceFailed: "હું તે સ્પષ્ટ રીતે સાંભળી શક્યો નહીં. કૃપા કરીને લખો અથવા વૉઇસ નોટ ફરી મોકલો।",
    injection: "હું તમારું ઉત્પાદન સૂચિબદ્ધ કરવામાં મદદ કરી શકું છું. તમે શું વેચવા માંગો છો તે કહો।",
    selfHarm: "તમે આવું અનુભવો છો તે સાંભળીને દુઃખ થયું. કૃપા કરીને હમણાં જ સ્થાનિક ઇમરજન્સી સેવા અથવા વિશ્વસનીય વ્યક્તિનો સંપર્ક કરો।",
    reset: "બરાબર, મેં આ ડ્રાફ્ટ સાફ કરી દીધો. જે ઉત્પાદન સૂચિબદ્ધ કરવું હોય તેની વિગતો મોકલો।",
    edit: "ચોક્કસ. કિંમત કે જથ્થો શું બદલવો છે તે કહો અને નવો નંબર મોકલો।",
    needTitle: "તમે કયું ઉત્પાદન સૂચિબદ્ધ કરવા માંગો છો?",
    needPrice: "એક પીસની કિંમત કેટલી છે?",
    needQuantity: "તમારી પાસે કેટલા છે?",
    listingSaved: "મેં આ વિગતો સાચવી છે. બાકીની માહિતી કહો।",
    tryAgain: "તમારી સૂચિ બનાવવા માટે ઉત્પાદન વિશે થોડું વધુ કહો।",
  },
  "kn-IN": {
    welcome: "SellThat ಗೆ ಸ್ವಾಗತ! ನೀವು ಯಾವ ಭಾಷೆಯನ್ನು ಬಳಸಲು ಬಯಸುತ್ತೀರಿ?",
    chooseRole: "ನೀವು ಮಾರಾಟಗಾರರಾ ಅಥವಾ ಖರೀದಿದಾರರಾ?",
    buyerSoon: "ಖರೀದಿ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ 🙏 ಈಗ ಮಾರಾಟಗಾರರು ಇಲ್ಲಿ ಉತ್ಪನ್ನಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಬಹುದು. ಮಾರಾಟ ಮಾಡಲು seller ಎಂದು ಬರೆಯಿರಿ।",
    verifyPrompt: "ಮಾರಾಟಗಾರರು ಮಾರಾಟ ಕಲಿಯಲು ನಮ್ಮ ಉಚಿತ ಸಮುದಾಯಕ್ಕೆ ಸೇರುತ್ತಾರೆ. ಇಲ್ಲಿ ಸೇರಿ: {communityLink}\n\nಸೇರಿದ ನಂತರ Verify me ಒತ್ತಿ।",
    verified: "ನಿಮ್ಮ ಪರಿಶೀಲನೆ ಪೂರ್ಣವಾಗಿದೆ! ✅ ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಫೋಟೋ ಕಳುಹಿಸಿ ಮತ್ತು ಅದರ ಬಗ್ಗೆ ತಿಳಿಸಿ. ಟೈಪ್ ಮಾಡಬಹುದು ಅಥವಾ ಧ್ವನಿ ಟಿಪ್ಪಣಿ ಕಳುಹಿಸಬಹುದು।",
    sendProduct: "ದಯವಿಟ್ಟು ಫೋಟೋ ಕಳುಹಿಸಿ ಅಥವಾ ನೀವು ಪಟ್ಟಿ ಮಾಡಲು ಬಯಸುವ ಉತ್ಪನ್ನದ ಬಗ್ಗೆ ತಿಳಿಸಿ।",
    verifyAgain: "ದಯವಿಟ್ಟು ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ ಮತ್ತು ಸಿದ್ಧವಾದಾಗ Verify me ಒತ್ತಿ।",
    voiceFailed: "ನಾನು ಅದನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಟಿಪ್ಪಣಿಯನ್ನು ಮತ್ತೆ ಕಳುಹಿಸಿ।",
    injection: "ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಪಟ್ಟಿ ಮಾಡಲು ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು. ನೀವು ಏನು ಮಾರಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ತಿಳಿಸಿ।",
    selfHarm: "ನೀವು ಹೀಗೆ ಭಾವಿಸುತ್ತಿರುವುದು ಕೇಳಿ ವಿಷಾದವಾಗಿದೆ. ದಯವಿಟ್ಟು ಈಗಲೇ ಸ್ಥಳೀಯ ತುರ್ತು ಸೇವೆ ಅಥವಾ ನಂಬಿಕೆಯ ವ್ಯಕ್ತಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ।",
    reset: "ಸರಿ, ನಾನು ಈ ಕರಡನ್ನು ತೆರವುಗೊಳಿಸಿದ್ದೇನೆ. ಪಟ್ಟಿ ಮಾಡಲು ಬಯಸುವ ಉತ್ಪನ್ನದ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ।",
    edit: "ಖಂಡಿತ. ಬೆಲೆಯೋ ಪ್ರಮಾಣವೋ ಯಾವುದನ್ನು ಬದಲಿಸಬೇಕೆಂದು ತಿಳಿಸಿ ಮತ್ತು ಹೊಸ ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ।",
    needTitle: "ನೀವು ಯಾವ ಉತ್ಪನ್ನವನ್ನು ಪಟ್ಟಿ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
    needPrice: "ಒಂದು ಪೀಸ್‌ನ ಬೆಲೆ ಎಷ್ಟು?",
    needQuantity: "ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಇವೆ?",
    listingSaved: "ನಾನು ಈ ವಿವರಗಳನ್ನು ಉಳಿಸಿದ್ದೇನೆ. ಉಳಿದ ಮಾಹಿತಿಯನ್ನು ತಿಳಿಸಿ।",
    tryAgain: "ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ತಯಾರಿಸಲು ಉತ್ಪನ್ನದ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚು ತಿಳಿಸಿ।",
  },
  "ml-IN": {
    welcome: "SellThat-ലേക്ക് സ്വാഗതം! നിങ്ങൾ ഏത് ഭാഷ ഉപയോഗിക്കാൻ ആഗ്രഹിക്കുന്നു?",
    chooseRole: "നിങ്ങൾ വിൽപ്പനക്കാരനാണോ വാങ്ങുന്നയാളാണോ?",
    buyerSoon: "വാങ്ങൽ ഉടൻ വരുന്നു 🙏 ഇപ്പോൾ വിൽപ്പനക്കാർക്ക് ഇവിടെ ഉൽപ്പന്നങ്ങൾ ലിസ്റ്റ് ചെയ്യാം. വിൽക്കാൻ seller എന്ന് ടൈപ്പ് ചെയ്യൂ।",
    verifyPrompt: "വിൽപ്പനക്കാർ വിൽക്കാൻ പഠിക്കാൻ ഞങ്ങളുടെ സൗജന്യ കമ്മ്യൂണിറ്റിയിൽ ചേരുന്നു. ഇവിടെ ചേരൂ: {communityLink}\n\nചേർന്ന ശേഷം Verify me അമർത്തൂ।",
    verified: "നിങ്ങൾ സ്ഥിരീകരിക്കപ്പെട്ടു! ✅ നിങ്ങളുടെ ഉൽപ്പന്നത്തിന്റെ ഫോട്ടോ അയച്ച് അതിനെക്കുറിച്ച് പറയൂ. ടൈപ്പ് ചെയ്യാം അല്ലെങ്കിൽ വോയ്സ് നോട്ട് അയക്കാം।",
    sendProduct: "ദയവായി ഫോട്ടോ അയക്കൂ അല്ലെങ്കിൽ ലിസ്റ്റ് ചെയ്യാൻ ആഗ്രഹിക്കുന്ന ഉൽപ്പന്നത്തെക്കുറിച്ച് പറയൂ।",
    verifyAgain: "ദയവായി കമ്മ്യൂണിറ്റിയിൽ ചേർന്ന് തയ്യാറാകുമ്പോൾ Verify me അമർത്തൂ।",
    voiceFailed: "എനിക്ക് അത് വ്യക്തമായി കേൾക്കാനായില്ല. ദയവായി ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ വോയ്സ് നോട്ട് വീണ്ടും അയക്കുക।",
    injection: "നിങ്ങളുടെ ഉൽപ്പന്നം ലിസ്റ്റ് ചെയ്യാൻ ഞാൻ സഹായിക്കാം. എന്താണ് വിൽക്കാൻ ആഗ്രഹിക്കുന്നത് എന്ന് പറയൂ।",
    selfHarm: "നിങ്ങൾക്ക് ഇങ്ങനെ തോന്നുന്നതിൽ എനിക്ക് ദുഃഖമുണ്ട്. ദയവായി ഇപ്പോൾ തന്നെ പ്രാദേശിക അടിയന്തര സേവനങ്ങളെയോ വിശ്വസ്തനായ ഒരാളെയോ ബന്ധപ്പെടൂ।",
    reset: "ശരി, ഞാൻ ഈ ഡ്രാഫ്റ്റ് മായ്ച്ചു. ലിസ്റ്റ് ചെയ്യാൻ ആഗ്രഹിക്കുന്ന ഉൽപ്പന്നത്തിന്റെ വിവരങ്ങൾ അയക്കൂ।",
    edit: "തീർച്ചയായും. വിലയോ അളവോ ഏത് മാറ്റണമെന്നു പറഞ്ഞ് പുതിയ നമ്പർ അയക്കൂ।",
    needTitle: "ഏത് ഉൽപ്പന്നമാണ് നിങ്ങൾ ലിസ്റ്റ് ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?",
    needPrice: "ഓരോന്നിന്റെ വില എത്രയാണ്?",
    needQuantity: "നിങ്ങളുടെ കൈയിൽ എത്ര ഉണ്ട്?",
    listingSaved: "ഈ വിവരങ്ങൾ ഞാൻ സംരക്ഷിച്ചു. ബാക്കി വിവരങ്ങൾ പറയൂ।",
    tryAgain: "നിങ്ങളുടെ ലിസ്റ്റിംഗ് തയ്യാറാക്കാൻ ഉൽപ്പന്നത്തെക്കുറിച്ച് കുറച്ചുകൂടി പറയൂ।",
  },
  "pa-IN": {
    welcome: "SellThat ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ! ਤੁਸੀਂ ਕਿਹੜੀ ਭਾਸ਼ਾ ਵਰਤਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    chooseRole: "ਕੀ ਤੁਸੀਂ ਵਿਕਰੇਤਾ ਹੋ ਜਾਂ ਖਰੀਦਦਾਰ?",
    buyerSoon: "ਖਰੀਦਾਰੀ ਜਲਦੀ ਆ ਰਹੀ ਹੈ 🙏 ਇਸ ਵੇਲੇ ਵਿਕਰੇਤਾ ਇੱਥੇ ਉਤਪਾਦ ਸੂਚੀਬੱਧ ਕਰ ਸਕਦੇ ਹਨ। ਵੇਚਣ ਲਈ seller ਲਿਖੋ।",
    verifyPrompt: "ਵਿਕਰੇਤਾ ਵੇਚਣਾ ਸਿੱਖਣ ਲਈ ਸਾਡੇ ਮੁਫ਼ਤ ਕਮਿਊਨਿਟੀ ਨਾਲ ਜੁੜਦੇ ਹਨ। ਇੱਥੇ ਜੁੜੋ: {communityLink}\n\nਜੁੜਨ ਤੋਂ ਬਾਅਦ Verify me ਦਬਾਓ।",
    verified: "ਤੁਹਾਡੀ ਤਸਦੀਕ ਹੋ ਗਈ ਹੈ! ✅ ਆਪਣੇ ਉਤਪਾਦ ਦੀ ਫੋਟੋ ਭੇਜੋ ਅਤੇ ਇਸ ਬਾਰੇ ਦੱਸੋ। ਤੁਸੀਂ ਲਿਖ ਸਕਦੇ ਹੋ ਜਾਂ ਵੌਇਸ ਨੋਟ ਭੇਜ ਸਕਦੇ ਹੋ।",
    sendProduct: "ਕਿਰਪਾ ਕਰਕੇ ਫੋਟੋ ਭੇਜੋ ਜਾਂ ਜਿਸ ਉਤਪਾਦ ਦੀ ਸੂਚੀ ਬਣਾਉਣੀ ਹੈ ਉਸ ਬਾਰੇ ਦੱਸੋ।",
    verifyAgain: "ਕਿਰਪਾ ਕਰਕੇ ਕਮਿਊਨਿਟੀ ਨਾਲ ਜੁੜੋ ਅਤੇ ਤਿਆਰ ਹੋਣ 'ਤੇ Verify me ਦਬਾਓ।",
    voiceFailed: "ਮੈਨੂੰ ਉਹ ਸਾਫ਼ ਨਹੀਂ ਸੁਣਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਲਿਖੋ ਜਾਂ ਵੌਇਸ ਨੋਟ ਦੁਬਾਰਾ ਭੇਜੋ।",
    injection: "ਮੈਂ ਤੁਹਾਡਾ ਉਤਪਾਦ ਸੂਚੀਬੱਧ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਦੱਸੋ ਕਿ ਤੁਸੀਂ ਕੀ ਵੇਚਣਾ ਚਾਹੁੰਦੇ ਹੋ।",
    selfHarm: "ਮੈਨੂੰ ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਤੁਸੀਂ ਇਸ ਤਰ੍ਹਾਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ। ਕਿਰਪਾ ਕਰਕੇ ਹੁਣੇ ਸਥਾਨਕ ਐਮਰਜੈਂਸੀ ਸੇਵਾ ਜਾਂ ਕਿਸੇ ਭਰੋਸੇਯੋਗ ਵਿਅਕਤੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    reset: "ਠੀਕ ਹੈ, ਮੈਂ ਇਹ ਡਰਾਫਟ ਸਾਫ਼ ਕਰ ਦਿੱਤਾ ਹੈ। ਜਿਸ ਉਤਪਾਦ ਦੀ ਸੂਚੀ ਬਣਾਉਣੀ ਹੈ ਉਸ ਦੀ ਜਾਣਕਾਰੀ ਭੇਜੋ।",
    edit: "ਜ਼ਰੂਰ। ਦੱਸੋ ਕੀਮਤ ਜਾਂ ਮਾਤਰਾ ਵਿੱਚ ਕੀ ਬਦਲਣਾ ਹੈ ਅਤੇ ਨਵਾਂ ਨੰਬਰ ਭੇਜੋ।",
    needTitle: "ਤੁਸੀਂ ਕਿਹੜਾ ਉਤਪਾਦ ਸੂਚੀਬੱਧ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    needPrice: "ਇੱਕ ਪੀਸ ਦੀ ਕੀਮਤ ਕੀ ਹੈ?",
    needQuantity: "ਤੁਹਾਡੇ ਕੋਲ ਕਿੰਨੇ ਹਨ?",
    listingSaved: "ਮੈਂ ਇਹ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਕਰ ਲਈ ਹੈ। ਬਾਕੀ ਜਾਣਕਾਰੀ ਦੱਸੋ।",
    tryAgain: "ਤੁਹਾਡੀ ਸੂਚੀ ਤਿਆਰ ਕਰਨ ਲਈ ਉਤਪਾਦ ਬਾਰੇ ਕੁਝ ਹੋਰ ਦੱਸੋ।",
  },
  "or-IN": {
    welcome: "SellThat କୁ ସ୍ୱାଗତ! ଆପଣ କେଉଁ ଭାଷା ବ୍ୟବହାର କରିବାକୁ ଚାହାନ୍ତି?",
    chooseRole: "ଆପଣ ବିକ୍ରେତା ନା କ୍ରେତା?",
    buyerSoon: "କିଣାକିଣି ଶୀଘ୍ର ଆସୁଛି 🙏 ବର୍ତ୍ତମାନ ବିକ୍ରେତାମାନେ ଏଠାରେ ପଦାର୍ଥ ତାଲିକାଭୁକ୍ତ କରିପାରିବେ। ବିକ୍ରି କରିବାକୁ seller ଲେଖନ୍ତୁ।",
    verifyPrompt: "ବିକ୍ରେତାମାନେ ବିକ୍ରି ଶିଖିବା ପାଇଁ ଆମର ମାଗଣା ସମୁଦାୟରେ ଯୋଗ ଦିଅନ୍ତି। ଏଠାରେ ଯୋଗ ଦିଅନ୍ତୁ: {communityLink}\n\nଯୋଗ ଦେବା ପରେ Verify me ଦବାନ୍ତୁ।",
    verified: "ଆପଣ ସତ୍ୟାପିତ ହୋଇଛନ୍ତି! ✅ ଆପଣଙ୍କ ପଦାର୍ଥର ଫଟୋ ପଠାନ୍ତୁ ଏବଂ ଏହା ବିଷୟରେ କୁହନ୍ତୁ। ଟାଇପ କରିପାରିବେ କିମ୍ବା ଭଏସ୍ ନୋଟ୍ ପଠାଇପାରିବେ।",
    sendProduct: "ଦୟାକରି ଫଟୋ ପଠାନ୍ତୁ କିମ୍ବା ଯେଉଁ ପଦାର୍ଥ ତାଲିକାଭୁକ୍ତ କରିବାକୁ ଚାହାନ୍ତି ସେ ବିଷୟରେ କୁହନ୍ତୁ।",
    verifyAgain: "ଦୟାକରି ସମୁଦାୟରେ ଯୋଗ ଦିଅନ୍ତୁ ଏବଂ ପ୍ରସ୍ତୁତ ହେଲେ Verify me ଦବାନ୍ତୁ।",
    voiceFailed: "ମୁଁ ତାହା ସ୍ପଷ୍ଟ ଭାବରେ ଶୁଣିପାରିଲି ନାହିଁ। ଦୟାକରି ଟାଇପ କରନ୍ତୁ କିମ୍ବା ଭଏସ୍ ନୋଟ୍ ପୁଣି ପଠାନ୍ତୁ।",
    injection: "ମୁଁ ଆପଣଙ୍କ ପଦାର୍ଥ ତାଲିକାଭୁକ୍ତ କରିବାରେ ସାହାଯ୍ୟ କରିପାରିବି। ଆପଣ କ’ଣ ବିକ୍ରି କରିବାକୁ ଚାହାନ୍ତି କୁହନ୍ତୁ।",
    selfHarm: "ଆପଣ ଏପରି ଅନୁଭବ କରୁଛନ୍ତି ବୋଲି ଶୁଣି ମୋତେ ଦୁଃଖ ଲାଗୁଛି। ଦୟାକରି ଏବେ ସ୍ଥାନୀୟ ଜରୁରୀ ସେବା କିମ୍ବା ଜଣେ ବିଶ୍ୱସ୍ତ ବ୍ୟକ୍ତିଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
    reset: "ଠିକ୍ ଅଛି, ମୁଁ ଏହି ଡ୍ରାଫ୍ଟ ସଫା କରିଦେଇଛି। ତାଲିକାଭୁକ୍ତ କରିବାକୁ ଚାହୁଁଥିବା ପଦାର୍ଥର ବିବରଣୀ ପଠାନ୍ତୁ।",
    edit: "ନିଶ୍ଚୟ। ଦାମ କିମ୍ବା ପରିମାଣ କ’ଣ ବଦଳାଇବେ କୁହନ୍ତୁ ଏବଂ ନୂଆ ସଂଖ୍ୟା ପଠାନ୍ତୁ।",
    needTitle: "ଆପଣ କେଉଁ ପଦାର୍ଥ ତାଲିକାଭୁକ୍ତ କରିବାକୁ ଚାହାନ୍ତି?",
    needPrice: "ପ୍ରତିଟିର ଦାମ କେତେ?",
    needQuantity: "ଆପଣଙ୍କ ପାଖରେ କେତେଟି ଅଛି?",
    listingSaved: "ମୁଁ ଏହି ବିବରଣୀ ସଞ୍ଚୟ କରିଛି। ବାକି ସୂଚନା କୁହନ୍ତୁ।",
    tryAgain: "ଆପଣଙ୍କ ତାଲିକା ତିଆରି କରିବା ପାଇଁ ପଦାର୍ଥ ବିଷୟରେ ଆଉ କିଛି କୁହନ୍ତୁ।",
  },
};

export function text(language: LanguageCode, key: CopyKey, values: Record<string, string> = {}): string {
  return copy[language][key].replace(/\{(\w+)\}/g, (_match, name: string) => values[name] ?? "");
}

export function languageButtons(): ReplyButton[] {
  return [
    { id: "lang_en-IN", title: "English" },
    { id: "lang_hi-IN", title: "हिंदी" },
    { id: "lang_more", title: "All languages" },
  ];
}

export function moreLanguagesPrompt(language: LanguageCode): string {
  return moreLanguagesList(language).body;
}

type MoreLanguageListLabels = Readonly<{
  body: string;
  button: string;
  sectionTitle: string;
}>;

const MORE_LANGUAGE_LIST_LABELS: Record<LanguageCode, MoreLanguageListLabels> = {
  "en-IN": {
    body: "Choose a language from the list.",
    button: "Choose language",
    sectionTitle: "Languages",
  },
  "hi-IN": {
    body: "सूची से भाषा चुनें।",
    button: "भाषा चुनें",
    sectionTitle: "भाषाएँ",
  },
  "bn-IN": {
    body: "তালিকা থেকে ভাষা বেছে নিন।",
    button: "ভাষা বাছুন",
    sectionTitle: "ভাষা",
  },
  "te-IN": {
    body: "జాబితా నుంచి భాష ఎంచుకోండి.",
    button: "భాష ఎంచుకోండి",
    sectionTitle: "భాషలు",
  },
  "mr-IN": {
    body: "यादीतून भाषा निवडा.",
    button: "भाषा निवडा",
    sectionTitle: "भाषा",
  },
  "ta-IN": {
    body: "பட்டியலில் மொழியைத் தேர்வு செய்க.",
    button: "மொழி தேர்வு",
    sectionTitle: "மொழிகள்",
  },
  "gu-IN": {
    body: "યાદીમાંથી ભાષા પસંદ કરો.",
    button: "ભાષા પસંદ કરો",
    sectionTitle: "ભાષાઓ",
  },
  "kn-IN": {
    body: "ಪಟ್ಟಿಯಿಂದ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ.",
    button: "ಭಾಷೆ ಆಯ್ಕೆ",
    sectionTitle: "ಭಾಷೆಗಳು",
  },
  "ml-IN": {
    body: "പട്ടികയിൽ നിന്ന് ഭാഷ തിരഞ്ഞെടുക്കുക.",
    button: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    sectionTitle: "ഭാഷകൾ",
  },
  "pa-IN": {
    body: "ਸੂਚੀ ਵਿੱਚੋਂ ਭਾਸ਼ਾ ਚੁਣੋ।",
    button: "ਭਾਸ਼ਾ ਚੁਣੋ",
    sectionTitle: "ਭਾਸ਼ਾਵਾਂ",
  },
  "or-IN": {
    body: "ତାଲିକାରୁ ଭାଷା ବାଛନ୍ତୁ।",
    button: "ଭାଷା ବାଛନ୍ତୁ",
    sectionTitle: "ଭାଷା",
  },
};

const MORE_LANGUAGE_ROWS: readonly ReplyListRow[] = [
  { id: "lang_bn-IN", title: "বাংলা" },
  { id: "lang_te-IN", title: "తెలుగు" },
  { id: "lang_mr-IN", title: "मराठी" },
  { id: "lang_ta-IN", title: "தமிழ்" },
  { id: "lang_gu-IN", title: "ગુજરાતી" },
  { id: "lang_kn-IN", title: "ಕನ್ನಡ" },
  { id: "lang_ml-IN", title: "മലയാളം" },
  { id: "lang_pa-IN", title: "ਪੰਜਾਬੀ" },
  { id: "lang_or-IN", title: "ଓଡ଼ିଆ" },
];

/** The remaining supported languages, all selectable without typing. */
export function moreLanguagesList(language: LanguageCode): ReplyList {
  const labels = MORE_LANGUAGE_LIST_LABELS[language];
  return {
    body: labels.body,
    button: labels.button,
    sections: [{ title: labels.sectionTitle, rows: MORE_LANGUAGE_ROWS }],
  };
}

export function roleButtons(language: LanguageCode): ReplyButton[] {
  const titles: Record<LanguageCode, readonly [string, string]> = {
    "en-IN": ["Seller", "Buyer"],
    "hi-IN": ["विक्रेता", "खरीदार"],
    "bn-IN": ["বিক্রেতা", "ক্রেতা"],
    "te-IN": ["అమ్మకందారు", "కొనుగోలుదారు"],
    "mr-IN": ["विक्रेता", "खरेदीदार"],
    "ta-IN": ["விற்பனையாளர்", "வாங்குபவர்"],
    "gu-IN": ["વેચનાર", "ખરીદદાર"],
    "kn-IN": ["ಮಾರಾಟಗಾರ", "ಖರೀದಿದಾರ"],
    "ml-IN": ["വിൽപ്പനക്കാരൻ", "വാങ്ങുന്നയാൾ"],
    "pa-IN": ["ਵਿਕਰੇਤਾ", "ਖਰੀਦਦਾਰ"],
    "or-IN": ["ବିକ୍ରେତା", "କ୍ରେତା"],
  };
  const [seller, buyer] = titles[language];
  return [
    { id: "role_seller", title: seller },
    { id: "role_buyer", title: buyer },
  ];
}

export function verifyButtons(language: LanguageCode = "en-IN"): ReplyButton[] {
  const titles: Record<LanguageCode, string> = {
    "en-IN": "Verify me",
    "hi-IN": "सत्यापित करें",
    "bn-IN": "যাচাই করুন",
    "te-IN": "ధృవీకరించండి",
    "mr-IN": "सत्यापित करा",
    "ta-IN": "சரிபார்க்கவும்",
    "gu-IN": "ચકાસો",
    "kn-IN": "ಪರಿಶೀಲಿಸಿ",
    "ml-IN": "പരിശോധിക്കുക",
    "pa-IN": "ਤਸਦੀਕ ਕਰੋ",
    "or-IN": "ଯାଞ୍ଚ କରନ୍ତୁ",
  };
  return [{ id: "verify_yes", title: titles[language] }];
}

type SellerManagementCopyKey =
  | "sellerMenuPrompt"
  | "managePrompt"
  | "noListings"
  | "chooseListing"
  | "chooseAction"
  | "editPricePrompt"
  | "editQuantityPrompt"
  | "editDetailsPrompt"
  | "replacePhotoPrompt"
  | "saveChangesPrompt"
  | "changesSaved"
  | "listingStatusUpdated";

type SellerManagementCopy = Record<SellerManagementCopyKey, string>;

const SELLER_MENU_TITLES: Record<LanguageCode, readonly [string, string, string]> = {
  "en-IN": ["New listing", "My listings", "Language"],
  "hi-IN": ["नई सूची", "मेरी सूचियाँ", "भाषा बदलें"],
  "bn-IN": ["নতুন তালিকা", "আমার তালিকা", "ভাষা বদলান"],
  "te-IN": ["కొత్త జాబితా", "నా జాబితాలు", "భాష మార్చండి"],
  "mr-IN": ["नवीन सूची", "माझ्या सूची", "भाषा बदला"],
  "ta-IN": ["புதிய பட்டியல்", "என் பட்டியல்கள்", "மொழி மாற்று"],
  "gu-IN": ["નવી સૂચિ", "મારી સૂચિઓ", "ભાષા બદલો"],
  "kn-IN": ["ಹೊಸ ಪಟ್ಟಿ", "ನನ್ನ ಪಟ್ಟಿಗಳು", "ಭಾಷೆ ಬದಲಿಸಿ"],
  "ml-IN": ["പുതിയ ലിസ്റ്റിംഗ്", "എന്റെ ലിസ്റ്റുകൾ", "ഭാഷ മാറ്റുക"],
  "pa-IN": ["ਨਵੀਂ ਸੂਚੀ", "ਮੇਰੀਆਂ ਸੂਚੀਆਂ", "ਭਾਸ਼ਾ ਬਦਲੋ"],
  "or-IN": ["ନୂଆ ତାଲିକା", "ମୋ ତାଲିକା", "ଭାଷା ବଦଳାନ୍ତୁ"],
};

const SELLER_MANAGEMENT_COPY: Record<LanguageCode, SellerManagementCopy> = {
  "en-IN": {
    sellerMenuPrompt: "What would you like to do?",
    managePrompt: "Manage your product listings here.",
    noListings: "You do not have any listings yet. Tap New listing to add one.",
    chooseListing: "Choose a listing to manage.",
    chooseAction: "What would you like to change?",
    editPricePrompt: "Send the new price in rupees.",
    editQuantityPrompt: "Send the new quantity.",
    editDetailsPrompt: "Send the updated product details.",
    replacePhotoPrompt: "Send a new product photo.",
    saveChangesPrompt: "Review the changes and tap Save.",
    changesSaved: "Your changes have been saved.",
    listingStatusUpdated: "Your listing status has been updated.",
  },
  "hi-IN": {
    sellerMenuPrompt: "आप क्या करना चाहते हैं?",
    managePrompt: "यहाँ अपनी उत्पाद सूचियाँ प्रबंधित करें।",
    noListings: "अभी आपकी कोई सूची नहीं है। नई सूची जोड़ने के लिए नई सूची दबाएँ।",
    chooseListing: "प्रबंधित करने के लिए एक सूची चुनें।",
    chooseAction: "आप क्या बदलना चाहते हैं?",
    editPricePrompt: "रुपयों में नई कीमत भेजें।",
    editQuantityPrompt: "नई मात्रा भेजें।",
    editDetailsPrompt: "उत्पाद का नया विवरण भेजें।",
    replacePhotoPrompt: "उत्पाद की नई फोटो भेजें।",
    saveChangesPrompt: "बदलाव देखें और सहेजें दबाएँ।",
    changesSaved: "आपके बदलाव सहेज दिए गए हैं।",
    listingStatusUpdated: "आपकी सूची की स्थिति अपडेट कर दी गई है।",
  },
  "bn-IN": {
    sellerMenuPrompt: "আপনি কী করতে চান?",
    managePrompt: "এখানে আপনার পণ্যের তালিকা পরিচালনা করুন।",
    noListings: "আপনার এখনও কোনো তালিকা নেই। একটি যোগ করতে নতুন তালিকা চাপুন।",
    chooseListing: "পরিচালনার জন্য একটি তালিকা বেছে নিন।",
    chooseAction: "আপনি কী বদলাতে চান?",
    editPricePrompt: "রুপিতে নতুন দাম পাঠান।",
    editQuantityPrompt: "নতুন পরিমাণ পাঠান।",
    editDetailsPrompt: "পণ্যের নতুন বিবরণ পাঠান।",
    replacePhotoPrompt: "পণ্যের নতুন ছবি পাঠান।",
    saveChangesPrompt: "বদলগুলি দেখে সংরক্ষণ চাপুন।",
    changesSaved: "আপনার বদলগুলি সংরক্ষণ করা হয়েছে।",
    listingStatusUpdated: "আপনার তালিকার অবস্থা আপডেট করা হয়েছে।",
  },
  "te-IN": {
    sellerMenuPrompt: "మీరు ఏమి చేయాలనుకుంటున్నారు?",
    managePrompt: "ఇక్కడ మీ ఉత్పత్తి జాబితాలను నిర్వహించండి.",
    noListings: "మీకు ఇంకా జాబితాలు లేవు. ఒకటి జోడించడానికి కొత్త జాబితాను నొక్కండి.",
    chooseListing: "నిర్వహించడానికి ఒక జాబితాను ఎంచుకోండి.",
    chooseAction: "మీరు ఏమి మార్చాలనుకుంటున్నారు?",
    editPricePrompt: "రూపాయల్లో కొత్త ధరను పంపండి.",
    editQuantityPrompt: "కొత్త పరిమాణాన్ని పంపండి.",
    editDetailsPrompt: "ఉత్పత్తి కొత్త వివరాలను పంపండి.",
    replacePhotoPrompt: "ఉత్పత్తి కొత్త ఫోటోను పంపండి.",
    saveChangesPrompt: "మార్పులను చూసి సేవ్ నొక్కండి.",
    changesSaved: "మీ మార్పులు సేవ్ అయ్యాయి.",
    listingStatusUpdated: "మీ జాబితా స్థితి నవీకరించబడింది.",
  },
  "mr-IN": {
    sellerMenuPrompt: "तुम्हाला काय करायचे आहे?",
    managePrompt: "येथे तुमच्या उत्पादन सूची व्यवस्थापित करा।",
    noListings: "तुमच्याकडे अजून कोणतीही सूची नाही। एक जोडण्यासाठी नवीन सूची दाबा।",
    chooseListing: "व्यवस्थापित करण्यासाठी एक सूची निवडा।",
    chooseAction: "तुम्हाला काय बदलायचे आहे?",
    editPricePrompt: "रुपयांत नवीन किंमत पाठवा।",
    editQuantityPrompt: "नवीन प्रमाण पाठवा।",
    editDetailsPrompt: "उत्पादनाचे नवीन तपशील पाठवा।",
    replacePhotoPrompt: "उत्पादनाचा नवीन फोटो पाठवा।",
    saveChangesPrompt: "बदल पाहा आणि जतन करा दाबा।",
    changesSaved: "तुमचे बदल जतन झाले आहेत।",
    listingStatusUpdated: "तुमच्या सूचीची स्थिती अद्ययावत झाली आहे।",
  },
  "ta-IN": {
    sellerMenuPrompt: "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?",
    managePrompt: "உங்கள் பொருள் பட்டியல்களை இங்கே நிர்வகிக்கலாம்.",
    noListings: "உங்களிடம் இன்னும் பட்டியல் இல்லை. ஒன்றைச் சேர்க்க புதிய பட்டியலை அழுத்துங்கள்.",
    chooseListing: "நிர்வகிக்க ஒரு பட்டியலைத் தேர்ந்தெடுக்கவும்.",
    chooseAction: "நீங்கள் எதை மாற்ற விரும்புகிறீர்கள்?",
    editPricePrompt: "ரூபாயில் புதிய விலையை அனுப்புங்கள்.",
    editQuantityPrompt: "புதிய அளவை அனுப்புங்கள்.",
    editDetailsPrompt: "பொருளின் புதிய விவரங்களை அனுப்புங்கள்.",
    replacePhotoPrompt: "பொருளின் புதிய புகைப்படத்தை அனுப்புங்கள்.",
    saveChangesPrompt: "மாற்றங்களைப் பார்த்து சேமி அழுத்துங்கள்.",
    changesSaved: "உங்கள் மாற்றங்கள் சேமிக்கப்பட்டன.",
    listingStatusUpdated: "உங்கள் பட்டியல் நிலை புதுப்பிக்கப்பட்டது.",
  },
  "gu-IN": {
    sellerMenuPrompt: "તમે શું કરવા માંગો છો?",
    managePrompt: "અહીં તમારી ઉત્પાદન સૂચિઓ સંભાળો.",
    noListings: "તમારી પાસે હજી કોઈ સૂચિ નથી. એક ઉમેરવા નવી સૂચિ દબાવો.",
    chooseListing: "સંભાળવા માટે એક સૂચિ પસંદ કરો.",
    chooseAction: "તમે શું બદલવા માંગો છો?",
    editPricePrompt: "રૂપિયામાં નવી કિંમત મોકલો.",
    editQuantityPrompt: "નવી સંખ્યા મોકલો.",
    editDetailsPrompt: "ઉત્પાદનની નવી વિગતો મોકલો.",
    replacePhotoPrompt: "ઉત્પાદનનો નવો ફોટો મોકલો.",
    saveChangesPrompt: "ફેરફારો જોઈને સેવ દબાવો.",
    changesSaved: "તમારા ફેરફારો સેવ થયા છે.",
    listingStatusUpdated: "તમારી સૂચિની સ્થિતિ અપડેટ થઈ છે.",
  },
  "kn-IN": {
    sellerMenuPrompt: "ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
    managePrompt: "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಪಟ್ಟಿಗಳನ್ನು ಇಲ್ಲಿ ನಿರ್ವಹಿಸಿ.",
    noListings: "ನಿಮ್ಮ ಬಳಿ ಇನ್ನೂ ಯಾವುದೇ ಪಟ್ಟಿ ಇಲ್ಲ. ಒಂದನ್ನು ಸೇರಿಸಲು ಹೊಸ ಪಟ್ಟಿ ಒತ್ತಿ.",
    chooseListing: "ನಿರ್ವಹಿಸಲು ಒಂದು ಪಟ್ಟಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    chooseAction: "ನೀವು ಏನು ಬದಲಾಯಿಸಲು ಬಯಸುತ್ತೀರಿ?",
    editPricePrompt: "ರೂಪಾಯಿಗಳಲ್ಲಿ ಹೊಸ ಬೆಲೆಯನ್ನು ಕಳುಹಿಸಿ.",
    editQuantityPrompt: "ಹೊಸ ಪ್ರಮಾಣವನ್ನು ಕಳುಹಿಸಿ.",
    editDetailsPrompt: "ಉತ್ಪನ್ನದ ಹೊಸ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ.",
    replacePhotoPrompt: "ಉತ್ಪನ್ನದ ಹೊಸ ಫೋಟೋ ಕಳುಹಿಸಿ.",
    saveChangesPrompt: "ಬದಲಾವಣೆಗಳನ್ನು ನೋಡಿ ಸೇವ್ ಒತ್ತಿ.",
    changesSaved: "ನಿಮ್ಮ ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ.",
    listingStatusUpdated: "ನಿಮ್ಮ ಪಟ್ಟಿಯ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.",
  },
  "ml-IN": {
    sellerMenuPrompt: "നിങ്ങൾ എന്ത് ചെയ്യാൻ ആഗ്രഹിക്കുന്നു?",
    managePrompt: "നിങ്ങളുടെ ഉൽപ്പന്ന ലിസ്റ്റിംഗുകൾ ഇവിടെ നിയന്ത്രിക്കുക.",
    noListings: "നിങ്ങൾക്ക് ഇതുവരെ ലിസ്റ്റിംഗുകളൊന്നുമില്ല. ഒന്ന് ചേർക്കാൻ പുതിയ ലിസ്റ്റിംഗ് അമർത്തുക.",
    chooseListing: "നിയന്ത്രിക്കാൻ ഒരു ലിസ്റ്റിംഗ് തിരഞ്ഞെടുക്കുക.",
    chooseAction: "നിങ്ങൾ എന്താണ് മാറ്റാൻ ആഗ്രഹിക്കുന്നത്?",
    editPricePrompt: "രൂപയിൽ പുതിയ വില അയയ്ക്കുക.",
    editQuantityPrompt: "പുതിയ അളവ് അയയ്ക്കുക.",
    editDetailsPrompt: "ഉൽപ്പന്നത്തിന്റെ പുതിയ വിവരങ്ങൾ അയയ്ക്കുക.",
    replacePhotoPrompt: "ഉൽപ്പന്നത്തിന്റെ പുതിയ ഫോട്ടോ അയയ്ക്കുക.",
    saveChangesPrompt: "മാറ്റങ്ങൾ നോക്കി സേവ് അമർത്തുക.",
    changesSaved: "നിങ്ങളുടെ മാറ്റങ്ങൾ സംരക്ഷിച്ചു.",
    listingStatusUpdated: "നിങ്ങളുടെ ലിസ്റ്റിംഗ് നില പുതുക്കി.",
  },
  "pa-IN": {
    sellerMenuPrompt: "ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    managePrompt: "ਆਪਣੀਆਂ ਉਤਪਾਦ ਸੂਚੀਆਂ ਇੱਥੇ ਸੰਭਾਲੋ।",
    noListings: "ਤੁਹਾਡੀ ਹਾਲੇ ਕੋਈ ਸੂਚੀ ਨਹੀਂ ਹੈ। ਇੱਕ ਜੋੜਨ ਲਈ ਨਵੀਂ ਸੂਚੀ ਦਬਾਓ।",
    chooseListing: "ਸੰਭਾਲਣ ਲਈ ਇੱਕ ਸੂਚੀ ਚੁਣੋ।",
    chooseAction: "ਤੁਸੀਂ ਕੀ ਬਦਲਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    editPricePrompt: "ਰੁਪਏ ਵਿੱਚ ਨਵੀਂ ਕੀਮਤ ਭੇਜੋ।",
    editQuantityPrompt: "ਨਵੀਂ ਮਾਤਰਾ ਭੇਜੋ।",
    editDetailsPrompt: "ਉਤਪਾਦ ਦੇ ਨਵੇਂ ਵੇਰਵੇ ਭੇਜੋ।",
    replacePhotoPrompt: "ਉਤਪਾਦ ਦੀ ਨਵੀਂ ਫੋਟੋ ਭੇਜੋ।",
    saveChangesPrompt: "ਬਦਲਾਅ ਵੇਖੋ ਅਤੇ ਸੇਵ ਦਬਾਓ।",
    changesSaved: "ਤੁਹਾਡੇ ਬਦਲਾਅ ਸੇਵ ਹੋ ਗਏ ਹਨ।",
    listingStatusUpdated: "ਤੁਹਾਡੀ ਸੂਚੀ ਦੀ ਸਥਿਤੀ ਅੱਪਡੇਟ ਹੋ ਗਈ ਹੈ।",
  },
  "or-IN": {
    sellerMenuPrompt: "ଆପଣ କ'ଣ କରିବାକୁ ଚାହୁଁଛନ୍ତି?",
    managePrompt: "ଏଠାରେ ଆପଣଙ୍କ ଉତ୍ପାଦ ତାଲିକା ପରିଚାଳନା କରନ୍ତୁ।",
    noListings: "ଆପଣଙ୍କର ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ତାଲିକା ନାହିଁ। ଗୋଟିଏ ଯୋଡ଼ିବାକୁ ନୂଆ ତାଲିକା ଦବାନ୍ତୁ।",
    chooseListing: "ପରିଚାଳନା ପାଇଁ ଗୋଟିଏ ତାଲିକା ବାଛନ୍ତୁ।",
    chooseAction: "ଆପଣ କ'ଣ ବଦଳାଇବାକୁ ଚାହୁଁଛନ୍ତି?",
    editPricePrompt: "ଟଙ୍କାରେ ନୂଆ ଦାମ ପଠାନ୍ତୁ।",
    editQuantityPrompt: "ନୂଆ ପରିମାଣ ପଠାନ୍ତୁ।",
    editDetailsPrompt: "ଉତ୍ପାଦର ନୂଆ ବିବରଣୀ ପଠାନ୍ତୁ।",
    replacePhotoPrompt: "ଉତ୍ପାଦର ନୂଆ ଫଟୋ ପଠାନ୍ତୁ।",
    saveChangesPrompt: "ବଦଳଗୁଡ଼ିକ ଦେଖି ସେଭ୍ ଦବାନ୍ତୁ।",
    changesSaved: "ଆପଣଙ୍କ ବଦଳଗୁଡ଼ିକ ସଞ୍ଚୟ ହୋଇଛି।",
    listingStatusUpdated: "ଆପଣଙ୍କ ତାଲିକାର ସ୍ଥିତି ଅପଡେଟ୍ ହୋଇଛି।",
  },
};

function sellerManagementText(language: LanguageCode, key: SellerManagementCopyKey): string {
  return SELLER_MANAGEMENT_COPY[language][key];
}

/** Three high-frequency seller actions kept as native WhatsApp reply buttons. */
export function sellerMenuButtons(language: LanguageCode): ReplyButton[] {
  const [newListing, manageListings, changeLanguage] = SELLER_MENU_TITLES[language];
  return [
    { id: "seller_new_listing", title: newListing },
    { id: "seller_manage_listings", title: manageListings },
    { id: "seller_change_language", title: changeLanguage },
  ];
}

export function sellerMenuPrompt(language: LanguageCode): string {
  return sellerManagementText(language, "sellerMenuPrompt");
}

export function managePrompt(language: LanguageCode): string {
  return sellerManagementText(language, "managePrompt");
}

export function noListings(language: LanguageCode): string {
  return sellerManagementText(language, "noListings");
}

export function chooseListing(language: LanguageCode): string {
  return sellerManagementText(language, "chooseListing");
}

export function chooseAction(language: LanguageCode): string {
  return sellerManagementText(language, "chooseAction");
}

export function editPricePrompt(language: LanguageCode): string {
  return sellerManagementText(language, "editPricePrompt");
}

export function editQuantityPrompt(language: LanguageCode): string {
  return sellerManagementText(language, "editQuantityPrompt");
}

export function editDetailsPrompt(language: LanguageCode): string {
  return sellerManagementText(language, "editDetailsPrompt");
}

export function replacePhotoPrompt(language: LanguageCode): string {
  return sellerManagementText(language, "replacePhotoPrompt");
}

export function saveChangesPrompt(language: LanguageCode): string {
  return sellerManagementText(language, "saveChangesPrompt");
}

export function changesSaved(language: LanguageCode): string {
  return sellerManagementText(language, "changesSaved");
}

export function listingStatusUpdated(language: LanguageCode): string {
  return sellerManagementText(language, "listingStatusUpdated");
}

export function confirmationButtons(language: LanguageCode): ReplyButton[] {
  const titles: Record<LanguageCode, readonly [string, string]> = {
    "en-IN": ["Publish", "Edit"],
    "hi-IN": ["प्रकाशित करें", "बदलें"],
    "bn-IN": ["প্রকাশ করুন", "বদলান"],
    "te-IN": ["ప్రచురించండి", "మార్చండి"],
    "mr-IN": ["प्रकाशित करा", "बदला"],
    "ta-IN": ["வெளியிடு", "திருத்து"],
    "gu-IN": ["પ્રકાશિત કરો", "બદલો"],
    "kn-IN": ["ಪ್ರಕಟಿಸಿ", "ಬದಲಿಸಿ"],
    "ml-IN": ["പ്രസിദ്ധീകരിക്കുക", "തിരുത്തുക"],
    "pa-IN": ["ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ", "ਬਦਲੋ"],
    "or-IN": ["ପ୍ରକାଶ କରନ୍ତୁ", "ସମ୍ପାଦନ କରନ୍ତୁ"],
  };
  const [publish, edit] = titles[language];
  return [
    { id: "confirm_yes", title: publish },
    { id: "confirm_edit", title: edit },
  ];
}
