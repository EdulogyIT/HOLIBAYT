import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useParams, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BlogSocialShare } from "@/components/BlogSocialShare";
import { BlogComments } from "@/components/BlogComments";

// Import blog images
import blogRealEstateFuture from "@/assets/blog-real-estate-future.jpg";
import blogPropertyLocation from "@/assets/blog-property-location.jpg";
import blogShortStayRental from "@/assets/blog-short-stay-rental.jpg";
import blogPropertyValuation from "@/assets/blog-property-valuation.jpg";
import blogRenovationTips from "@/assets/blog-renovation-tips.jpg";
import blogLegalConsiderations from "@/assets/blog-legal-considerations.jpg";

const BlogPost = () => {
  const { t, currentLang } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  useScrollToTop();

  const blogPosts = [
    {
      id: 1,
      title: t('blogTitle1'),
      excerpt: t('blogExcerpt1'),
      author: t('author1'),
      date: t('march15'),
      readTime: t('readTime5'),
      category: t('marketTrends'),
      image: blogRealEstateFuture,
      content: currentLang === 'FR' ? `
        <p>Le marché immobilier algérien connaît une transformation significative, portée par l'innovation technologique, les changements démographiques et les réformes économiques. En regardant vers l'avenir, plusieurs tendances clés façonnent le paysage de l'investissement et du développement immobilier à travers le pays.</p>
        
        <h2>Transformation Digitale</h2>
        <p>La révolution numérique change fondamentalement la façon dont les Algériens achètent, vendent et louent des propriétés. Les plateformes en ligne comme Holibayt rendent les transactions immobilières plus transparentes, efficaces et accessibles à un public plus large. Les visites virtuelles, la documentation numérique et la correspondance immobilière assistée par IA deviennent des pratiques standard.</p>
        
        <h2>Développement Durable</h2>
        <p>La conscience environnementale stimule la demande de solutions de logement durables. Les pratiques de construction écologique, les conceptions écoénergétiques et l'intégration des énergies renouvelables deviennent des facteurs de plus en plus importants dans l'évaluation immobilière et les préférences des acheteurs.</p>
        
        <h2>Évolution de l'Urbanisme</h2>
        <p>Les grandes villes comme Alger, Oran et Constantine mettent en œuvre des initiatives de ville intelligente qui améliorent l'infrastructure, les transports et la qualité de vie. Ces développements créent de nouvelles opportunités d'investissement et remodèlent les valeurs immobilières dans différents quartiers.</p>
        
        <h2>Opportunités d'Investissement</h2>
        <p>Les réglementations sur l'investissement étranger deviennent plus favorables, ouvrant de nouvelles possibilités pour les acheteurs internationaux. Le secteur touristique en croissance présente également des opportunités sur les marchés de location à court terme, particulièrement dans les zones côtières et les centres-villes historiques.</p>
        
        <p>Alors que l'Algérie continue de moderniser son économie et ses infrastructures, le secteur immobilier est bien placé pour en bénéficier considérablement. Les investisseurs qui comprennent ces tendances et se positionnent en conséquence seront bien placés pour capitaliser sur les opportunités à venir.</p>
      ` : currentLang === 'AR' ? `
        <p>يشهد السوق العقاري الجزائري تحولاً كبيراً، مدفوعاً بالابتكار التكنولوجي والتغيرات الديموغرافية والإصلاحات الاقتصادية. عند النظر نحو المستقبل، تشكل عدة اتجاهات رئيسية مشهد الاستثمار والتطوير العقاري عبر البلاد.</p>
        
        <h2>التحول الرقمي</h2>
        <p>تغير الثورة الرقمية بشكل أساسي الطريقة التي يشتري ويبيع ويستأجر بها الجزائريون العقارات. منصات الإنترنت مثل هوليبايت تجعل المعاملات العقارية أكثر شفافية وكفاءة ومتاحة لجمهور أوسع. الجولات الافتراضية للعقارات والتوثيق الرقمي ومطابقة العقارات المدعومة بالذكاء الاصطناعي تصبح ممارسات معيارية.</p>
        
        <h2>التنمية المستدامة</h2>
        <p>يدفع الوعي البيئي الطلب على حلول الإسكان المستدام. ممارسات البناء الأخضر والتصاميم الموفرة للطاقة وتكامل الطاقة المتجددة تصبح عوامل مهمة بشكل متزايد في تقييم العقارات وتفضيلات المشترين.</p>
        
        <h2>تطور التخطيط العمراني</h2>
        <p>المدن الكبرى مثل الجزائر ووهران وقسنطينة تنفذ مبادرات المدن الذكية التي تحسن البنية التحتية والنقل وجودة الحياة. هذه التطورات تخلق فرص استثمار جديدة وتعيد تشكيل قيم العقارات عبر الأحياء المختلفة.</p>
        
        <h2>فرص الاستثمار</h2>
        <p>لوائح الاستثمار الأجنبي تصبح أكثر ملاءمة، مما يفتح إمكانيات جديدة للمشترين الدوليين. القطاع السياحي المتنامي يقدم أيضاً فرصاً في أسواق الإيجار قصير المدى، خاصة في المناطق الساحلية ومراكز المدن التاريخية.</p>
        
        <p>مع استمرار الجزائر في تحديث اقتصادها وبنيتها التحتية، القطاع العقاري في موضع جيد للاستفادة بشكل كبير. المستثمرون الذين يفهمون هذه الاتجاهات ويضعون أنفسهم وفقاً لذلك سيكونون في وضع جيد للاستفادة من الفرص المقبلة.</p>
      ` : `
        <p>Algeria's real estate market is undergoing a significant transformation, driven by technological innovation, demographic changes, and economic reforms. As we look toward the future, several key trends are shaping the landscape of property investment and development across the country.</p>
        
        <h2>Digital Transformation</h2>
        <p>The digital revolution is fundamentally changing how Algerians buy, sell, and rent properties. Online platforms like Holibayt are making property transactions more transparent, efficient, and accessible to a broader audience. Virtual property tours, digital documentation, and AI-powered property matching are becoming standard practices.</p>
        
        <h2>Sustainable Development</h2>
        <p>Environmental consciousness is driving demand for sustainable housing solutions. Green building practices, energy-efficient designs, and renewable energy integration are becoming increasingly important factors in property valuation and buyer preferences.</p>
        
        <h2>Urban Planning Evolution</h2>
        <p>Major cities like Algiers, Oran, and Constantine are implementing smart city initiatives that improve infrastructure, transportation, and quality of life. These developments are creating new investment opportunities and reshaping property values across different neighborhoods.</p>
        
        <h2>Investment Opportunities</h2>
        <p>Foreign investment regulations are becoming more favorable, opening new possibilities for international buyers. The growing tourism sector also presents opportunities in short-term rental markets, particularly in coastal areas and historic city centers.</p>
        
        <p>As Algeria continues to modernize its economy and infrastructure, the real estate sector stands to benefit significantly. Investors who understand these trends and position themselves accordingly will be well-placed to capitalize on the opportunities ahead.</p>
      `,
      source: "Holibayt Research Team",
      tags: ["Market Analysis", "Investment", "Technology", "Sustainability"]
    },
    {
      id: 2,
      title: t('blogTitle2'),
      excerpt: t('blogExcerpt2'),
      author: t('author2'),
      date: t('march10'),
      readTime: t('readTime7'),
      category: t('buyingGuide'),
      image: blogPropertyLocation,
      content: currentLang === 'FR' ? `
        <p>Choisir l'emplacement idéal pour votre propriété est l'une des décisions les plus importantes que vous prendrez. L'emplacement affecte non seulement votre qualité de vie, mais également la valeur de votre investissement. Voici quelques facteurs clés à prendre en compte :</p>
        
        <h2>Accessibilité</h2>
        <p>La proximité des commodités essentielles telles que les écoles, les hôpitaux et les centres commerciaux peut avoir un impact important sur votre routine quotidienne. Un bon accès aux réseaux de transport en commun et aux routes principales est également crucial.</p>
        
        <h2>Sécurité</h2>
        <p>La recherche des taux de criminalité et des mesures de sécurité du quartier peut vous apporter la tranquillité d'esprit. Un quartier sûr est essentiel pour élever une famille et maintenir la valeur de la propriété.</p>
        
        <h2>Potentiel de croissance</h2>
        <p>Tenez compte des plans de développement futurs dans la région. Les projets d'infrastructure, les nouveaux développements commerciaux et les améliorations de zonage peuvent tous avoir un impact sur la valeur de la propriété.</p>
        
        <h2>Commodités locales</h2>
        <p>Les parcs, les installations récréatives et les centres culturels améliorent la qualité de vie. La proximité de ces commodités peut rendre un emplacement plus souhaitable.</p>
        
        <p>En évaluant soigneusement ces facteurs, vous pouvez choisir un emplacement qui répond à vos besoins et maximise votre investissement immobilier.</p>
      ` : currentLang === 'AR' ? `
        <p>يعد اختيار الموقع المثالي لممتلكاتك أحد أهم القرارات التي ستتخذها. لا يؤثر الموقع على نوعية حياتك فحسب، بل يؤثر أيضًا على قيمة استثمارك. فيما يلي بعض العوامل الرئيسية التي يجب مراعاتها:</p>
        
        <h2>إمكانية الوصول</h2>
        <p>يمكن أن يؤثر قربك من المرافق الأساسية مثل المدارس والمستشفيات ومراكز التسوق بشكل كبير على روتينك اليومي. يعد الوصول الجيد إلى شبكات النقل العام والطرق الرئيسية أمرًا بالغ الأهمية أيضًا.</p>
        
        <h2>الأمان</h2>
        <p>يمكن أن يمنحك البحث عن معدلات الجريمة وإجراءات السلامة في الحي راحة البال. يعد الحي الآمن ضروريًا لتربية الأسرة والحفاظ على قيمة الممتلكات.</p>
        
        <h2>إمكانات النمو</h2>
        <p>ضع في اعتبارك خطط التطوير المستقبلية في المنطقة. يمكن أن تؤثر مشاريع البنية التحتية والتطورات التجارية الجديدة وتحسينات تقسيم المناطق على قيمة الممتلكات.</p>
        
        <h2>وسائل الراحة المحلية</h2>
        <p>تعمل الحدائق والمرافق الترفيهية والمراكز الثقافية على تحسين نوعية الحياة. يمكن أن يؤدي قربك من هذه المرافق إلى جعل الموقع أكثر جاذبية.</p>
        
        <p>من خلال التقييم الدقيق لهذه العوامل، يمكنك اختيار موقع يلبي احتياجاتك ويزيد من استثمارك العقاري.</p>
      ` : `
        <p>Choosing the right location for your property is one of the most important decisions you'll make. The location affects not only your quality of life but also the value of your investment. Here are some key factors to consider:</p>
        
        <h2>Accessibility</h2>
        <p>Proximity to essential amenities such as schools, hospitals, and shopping centers can significantly impact your daily routine. Good access to public transportation and major roads is also crucial.</p>
        
        <h2>Safety</h2>
        <p>Researching the crime rates and safety measures of the neighborhood can provide peace of mind. A safe neighborhood is essential for raising a family and maintaining property value.</p>
        
        <h2>Growth Potential</h2>
        <p>Consider future development plans in the area. Infrastructure projects, new commercial developments, and zoning improvements can all impact property value.</p>
        
        <h2>Local Amenities</h2>
        <p>Parks, recreational facilities, and cultural centers enhance the quality of life. Proximity to these amenities can make a location more desirable.</p>
        
        <p>By carefully evaluating these factors, you can choose a location that meets your needs and maximizes your real estate investment.</p>
      `,
      source: "Holibayt Real Estate Guide",
      tags: ["Location", "Real Estate", "Buying Guide", "Neighborhood"]
    },
    {
      id: 3,
      title: t('blogTitle3'),
      excerpt: t('blogExcerpt3'),
      author: t('author3'),
      date: t('march5'),
      readTime: t('readTime6'),
      category: t('investment'),
      image: blogShortStayRental,
      content: currentLang === 'FR' ? `
        <p>Les locations de courte durée sont devenues une option d'investissement populaire, offrant aux propriétaires la possibilité de générer des revenus grâce à leurs propriétés. Voici ce que vous devez savoir :</p>
        
        <h2>Demande du marché</h2>
        <p>Les zones touristiques, les centres-villes et les lieux événementiels connaissent une forte demande de locations de courte durée. La recherche de la demande locale peut vous aider à déterminer le potentiel de votre propriété.</p>
        
        <h2>Réglementation</h2>
        <p>Certaines villes ont des réglementations strictes concernant les locations de courte durée, notamment des exigences en matière de permis et des restrictions sur le nombre de jours où vous pouvez louer votre propriété. Assurez-vous de comprendre et de respecter ces règles.</p>
        
        <h2>Gestion immobilière</h2>
        <p>La gestion d'une location de courte durée nécessite du temps et des efforts. Vous pouvez choisir de gérer la propriété vous-même ou d'embaucher une société de gestion immobilière pour gérer les réservations, le nettoyage et l'entretien.</p>
        
        <h2>Potentiel de revenus</h2>
        <p>Les locations de courte durée peuvent générer des revenus importants, en particulier pendant les hautes saisons. Fixer le bon prix et offrir d'excellentes commodités peut attirer plus de locataires et maximiser vos revenus.</p>
        
        <p>Si elle est bien gérée, une location de courte durée peut être un investissement lucratif. Tenez compte de la demande du marché, des réglementations et de vos capacités de gestion avant de vous lancer.</p>
      ` : currentLang === 'AR' ? `
        <p>أصبحت الإيجارات قصيرة الأجل خيارًا استثماريًا شائعًا، حيث توفر لأصحاب العقارات فرصة لكسب الدخل من ممتلكاتهم. إليك ما تحتاج إلى معرفته:</p>
        
        <h2>الطلب في السوق</h2>
        <p>تشهد المناطق السياحية ومراكز المدن وأماكن الفعاليات طلبًا كبيرًا على الإيجارات قصيرة الأجل. يمكن أن يساعدك البحث عن الطلب المحلي في تحديد إمكانات الممتلكات الخاصة بك.</p>
        
        <h2>اللوائح</h2>
        <p>لدى بعض المدن لوائح صارمة بشأن الإيجارات قصيرة الأجل، بما في ذلك متطلبات الترخيص والقيود المفروضة على عدد الأيام التي يمكنك فيها استئجار الممتلكات الخاصة بك. تأكد من فهم هذه القواعد والامتثال لها.</p>
        
        <h2>إدارة الممتلكات</h2>
        <p>تتطلب إدارة الإيجار قصير الأجل وقتًا وجهدًا. يمكنك اختيار إدارة العقار بنفسك أو تعيين شركة إدارة عقارات للتعامل مع الحجوزات والتنظيف والصيانة.</p>
        
        <h2>إمكانية تحقيق الدخل</h2>
        <p>يمكن أن تحقق الإيجارات قصيرة الأجل دخلاً كبيرًا، خاصة خلال مواسم الذروة. يمكن أن يؤدي تحديد السعر المناسب وتقديم وسائل الراحة الممتازة إلى جذب المزيد من المستأجرين وزيادة أرباحك إلى أقصى حد.</p>
        
        <p>إذا تم إدارتها بشكل صحيح، يمكن أن يكون الإيجار قصير الأجل استثمارًا مربحًا. ضع في اعتبارك الطلب في السوق واللوائح وقدراتك الإدارية قبل البدء.</p>
      ` : `
        <p>Short-stay rentals have become a popular investment option, offering property owners the opportunity to generate income from their properties. Here's what you need to know:</p>
        
        <h2>Market Demand</h2>
        <p>Tourist areas, city centers, and event venues experience high demand for short-stay rentals. Researching local demand can help you determine the potential of your property.</p>
        
        <h2>Regulations</h2>
        <p>Some cities have strict regulations regarding short-stay rentals, including permit requirements and restrictions on the number of days you can rent out your property. Make sure you understand and comply with these rules.</p>
        
        <h2>Property Management</h2>
        <p>Managing a short-stay rental requires time and effort. You can choose to manage the property yourself or hire a property management company to handle bookings, cleaning, and maintenance.</p>
        
        <h2>Income Potential</h2>
        <p>Short-stay rentals can generate significant income, especially during peak seasons. Setting the right price and offering excellent amenities can attract more renters and maximize your earnings.</p>
        
        <p>If managed well, a short-stay rental can be a lucrative investment. Consider the market demand, regulations, and your management capabilities before diving in.</p>
      `,
      source: "Holibayt Investment Tips",
      tags: ["Short-Stay Rental", "Investment", "Property Management", "Real Estate"]
    },
    {
      id: 4,
      title: t('blogTitle4'),
      excerpt: t('blogExcerpt4'),
      author: t('author4'),
      date: t('february28'),
      readTime: t('readTime8'),
      category: t('finance'),
      image: blogPropertyValuation,
      content: currentLang === 'FR' ? `
        <p>Comprendre la valeur de votre propriété est essentiel à la fois pour la vente et le refinancement. Voici les facteurs clés qui influencent l'évaluation immobilière :</p>
        
        <h2>Emplacement</h2>
        <p>L'emplacement de votre propriété est l'un des facteurs les plus importants. Les propriétés situées dans des quartiers recherchés avec de bonnes écoles et des commodités ont tendance à avoir des valeurs plus élevées.</p>
        
        <h2>Taille et état</h2>
        <p>La taille de votre propriété, y compris le nombre de chambres et de salles de bains, ainsi que son état général, ont un impact sur sa valeur. Les propriétés bien entretenues et mises à jour se vendent généralement plus cher.</p>
        
        <h2>Ventes comparables</h2>
        <p>Les évaluateurs tiennent compte des ventes récentes de propriétés similaires dans votre région. Ces ventes comparables fournissent une base pour déterminer la valeur marchande de votre propriété.</p>
        
        <h2>Tendances du marché</h2>
        <p>Les conditions générales du marché immobilier, y compris les taux d'intérêt et l'offre et la demande, peuvent affecter la valeur de la propriété. Un marché d'acheteurs peut entraîner une baisse des valeurs, tandis qu'un marché de vendeurs peut les augmenter.</p>
        
        <p>Obtenir une évaluation précise est crucial pour prendre des décisions éclairées concernant votre investissement immobilier. Tenez compte de ces facteurs pour comprendre la valeur de votre propriété.</p>
      ` : currentLang === 'AR' ? `
        <p>يعد فهم قيمة الممتلكات الخاصة بك أمرًا ضروريًا لكل من البيع وإعادة التمويل. فيما يلي العوامل الرئيسية التي تؤثر على تقييم الممتلكات:</p>
        
        <h2>الموقع</h2>
        <p>يعد موقع الممتلكات الخاصة بك أحد أهم العوامل. تميل العقارات الواقعة في الأحياء المرغوبة التي بها مدارس جيدة ووسائل الراحة إلى الحصول على قيم أعلى.</p>
        
        <h2>الحجم والحالة</h2>
        <p>يؤثر حجم الممتلكات الخاصة بك، بما في ذلك عدد غرف النوم والحمامات، بالإضافة إلى حالتها العامة، على قيمتها. عادة ما يتم بيع العقارات التي يتم صيانتها وتحديثها جيدًا بسعر أعلى.</p>
        
        <h2>المبيعات المماثلة</h2>
        <p>يأخذ المثمنون في الاعتبار المبيعات الحديثة للعقارات المماثلة في منطقتك. توفر هذه المبيعات المماثلة أساسًا لتحديد القيمة السوقية للممتلكات الخاصة بك.</p>
        
        <h2>اتجاهات السوق</h2>
        <p>يمكن أن تؤثر الظروف العامة لسوق العقارات، بما في ذلك أسعار الفائدة والعرض والطلب، على قيمة العقارات. قد يؤدي سوق المشترين إلى انخفاض القيم، في حين أن سوق البائعين قد يزيدها.</p>
        
        <p>يعد الحصول على تقييم دقيق أمرًا بالغ الأهمية لاتخاذ قرارات مستنيرة بشأن استثمارك العقاري. ضع في اعتبارك هذه العوامل لفهم قيمة الممتلكات الخاصة بك.</p>
      ` : `
        <p>Understanding the value of your property is essential for both selling and refinancing. Here are the key factors that influence property valuation:</p>
        
        <h2>Location</h2>
        <p>The location of your property is one of the most significant factors. Properties in desirable neighborhoods with good schools and amenities tend to have higher values.</p>
        
        <h2>Size and Condition</h2>
        <p>The size of your property, including the number of bedrooms and bathrooms, as well as its overall condition, impacts its value. Well-maintained and updated properties typically sell for more.</p>
        
        <h2>Comparable Sales</h2>
        <p>Appraisers consider recent sales of similar properties in your area. These comparable sales provide a basis for determining the market value of your property.</p>
        
        <h2>Market Trends</h2>
        <p>The overall conditions of the real estate market, including interest rates and supply and demand, can affect property value. A buyer's market may lead to lower values, while a seller's market may increase them.</p>
        
        <p>Getting an accurate valuation is crucial for making informed decisions about your real estate investment. Consider these factors to understand your property's value.</p>
      `,
      source: "Holibayt Finance Insights",
      tags: ["Property Valuation", "Finance", "Real Estate", "Market Analysis"]
    },
    {
      id: 5,
      title: t('blogTitle5'),
      excerpt: t('blogExcerpt5'),
      author: t('author5'),
      date: t('february20'),
      readTime: t('readTime9'),
      category: t('renovation'),
      image: blogRenovationTips,
      content: currentLang === 'FR' ? `
        <p>La rénovation de votre propriété peut augmenter sa valeur et améliorer votre qualité de vie. Voici quelques conseils de rénovation essentiels :</p>
        
        <h2>Budget</h2>
        <p>Fixez un budget réaliste avant de commencer tout projet de rénovation. Tenez compte du coût des matériaux, de la main-d'œuvre et des dépenses imprévues.</p>
        
        <h2>Prioriser les améliorations</h2>
        <p>Concentrez-vous sur les rénovations qui auront le plus grand impact sur la valeur et la fonctionnalité de votre propriété. Les améliorations de la cuisine et de la salle de bain sont généralement un bon investissement.</p>
        
        <h2>Engager des professionnels</h2>
        <p>Pour les projets complexes, engagez des professionnels agréés pour garantir un travail de qualité. Un électricien ou un plombier qualifié peut éviter des problèmes coûteux à long terme.</p>
        
        <h2>Choisir des matériaux de qualité</h2>
        <p>Investissez dans des matériaux durables et de haute qualité qui résisteront à l'épreuve du temps. Cela peut vous faire économiser de l'argent à long terme en réduisant le besoin de réparations et de remplacements.</p>
        
        <p>Une rénovation bien planifiée peut transformer votre propriété et augmenter sa valeur. Planifiez soigneusement, engagez des professionnels si nécessaire et choisissez des matériaux de qualité pour obtenir les meilleurs résultats.</p>
      ` : currentLang === 'AR' ? `
        <p>يمكن أن يؤدي تجديد الممتلكات الخاصة بك إلى زيادة قيمتها وتحسين نوعية حياتك. فيما يلي بعض نصائح التجديد الأساسية:</p>
        
        <h2>الميزانية</h2>
        <p>ضع ميزانية واقعية قبل البدء في أي مشروع تجديد. ضع في اعتبارك تكلفة المواد والعمالة والنفقات غير المتوقعة.</p>
        
        <h2>تحديد أولويات التحسينات</h2>
        <p>ركز على التجديدات التي سيكون لها أكبر الأثر على قيمة الممتلكات الخاصة بك ووظائفها. عادة ما تكون ترقيات المطبخ والحمام استثمارًا جيدًا.</p>
        
        <h2>توظيف المهنيين</h2>
        <p>بالنسبة للمشاريع المعقدة، قم بتعيين متخصصين مرخصين لضمان جودة العمل. يمكن لفني كهربائي أو سباك مؤهل تجنب المشكلات المكلفة على المدى الطويل.</p>
        
        <h2>اختيار مواد عالية الجودة</h2>
        <p>استثمر في مواد متينة وعالية الجودة تصمد أمام اختبار الزمن. يمكن أن يوفر لك هذا المال على المدى الطويل عن طريق تقليل الحاجة إلى الإصلاحات والاستبدالات.</p>
        
        <p>يمكن أن يحول التجديد المخطط له جيدًا الممتلكات الخاصة بك ويزيد من قيمتها. خطط بعناية، واستأجر متخصصين إذا لزم الأمر، واختر مواد عالية الجودة للحصول على أفضل النتائج.</p>
      ` : `
        <p>Renovating your property can increase its value and improve your quality of life. Here are some essential renovation tips:</p>
        
        <h2>Budget</h2>
        <p>Set a realistic budget before starting any renovation project. Consider the cost of materials, labor, and unexpected expenses.</p>
        
        <h2>Prioritize Improvements</h2>
        <p>Focus on renovations that will have the biggest impact on your property's value and functionality. Kitchen and bathroom upgrades are typically a good investment.</p>
        
        <h2>Hire Professionals</h2>
        <p>For complex projects, hire licensed professionals to ensure quality work. A qualified electrician or plumber can prevent costly problems down the road.</p>
        
        <h2>Choose Quality Materials</h2>
        <p>Invest in durable, high-quality materials that will stand the test of time. This can save you money in the long run by reducing the need for repairs and replacements.</p>
        
        <p>A well-planned renovation can transform your property and increase its value. Plan carefully, hire professionals if needed, and choose quality materials for the best results.</p>
      `,
      source: "Holibayt Renovation Guide",
      tags: ["Renovation", "Home Improvement", "Real Estate", "DIY"]
    },
    {
      id: 6,
      title: t('blogTitle6'),
      excerpt: t('blogExcerpt6'),
      author: t('author6'),
      date: t('february15'),
      readTime: t('readTime10'),
      category: t('legal'),
      image: blogLegalConsiderations,
      content: currentLang === 'FR' ? `
        <p>Comprendre les aspects juridiques de l'immobilier est essentiel pour éviter les problèmes coûteux. Voici quelques considérations juridiques clés :</p>
        
        <h2>Contrats</h2>
        <p>Examinez attentivement tous les contrats avant de les signer. Demandez un avis juridique pour vous assurer que vous comprenez les termes et conditions.</p>
        
        <h2>Droits de propriété</h2>
        <p>Comprendre vos droits de propriété est essentiel. Cela comprend la connaissance des servitudes, des privilèges et des restrictions de zonage.</p>
        
        <h2>Divulgations</h2>
        <p>Soyez transparent sur tous les défauts ou problèmes connus avec la propriété. Le défaut de divulgation d'informations pertinentes peut entraîner des litiges juridiques.</p>
        
        <h2>Assurance</h2>
        <p>Maintenez une couverture d'assurance appropriée pour protéger votre propriété contre les dommages ou la responsabilité. Examinez régulièrement votre police pour vous assurer qu'elle répond à vos besoins.</p>
        
        <p>Les questions juridiques peuvent être complexes, il est donc conseillé de demander l'avis d'un professionnel du droit immobilier. Être informé et proactif peut vous aider à éviter les problèmes juridiques et à protéger votre investissement.</p>
      ` : currentLang === 'AR' ? `
        <p>يعد فهم الجوانب القانونية للعقارات أمرًا ضروريًا لتجنب المشكلات المكلفة. فيما يلي بعض الاعتبارات القانونية الرئيسية:</p>
        
        <h2>العقود</h2>
        <p>راجع جميع العقود بعناية قبل التوقيع عليها. اطلب المشورة القانونية للتأكد من أنك تفهم الشروط والأحكام.</p>
        
        <h2>حقوق الملكية</h2>
        <p>يعد فهم حقوق الملكية الخاصة بك أمرًا ضروريًا. يتضمن ذلك معرفة الارتفاقات والامتيازات وقيود تقسيم المناطق.</p>
        
        <h2>الإفصاحات</h2>
        <p>كن شفافًا بشأن أي عيوب أو مشكلات معروفة في العقار. قد يؤدي عدم الكشف عن المعلومات ذات الصلة إلى نزاعات قانونية.</p>
        
        <h2>التأمين</h2>
        <p>حافظ على تغطية تأمينية مناسبة لحماية الممتلكات الخاصة بك من التلف أو المسؤولية. راجع وثيقتك بانتظام للتأكد من أنها تلبي احتياجاتك.</p>
        
        <p>يمكن أن تكون المسائل القانونية معقدة، لذلك يُنصح بطلب المشورة من متخصص في قانون العقارات. يمكن أن يساعدك التحلي بالمعرفة والاستباقية في تجنب المشكلات القانونية وحماية استثمارك.</p>
      ` : `
        <p>Understanding the legal aspects of real estate is essential to avoid costly problems. Here are some key legal considerations:</p>
        
        <h2>Contracts</h2>
        <p>Carefully review all contracts before signing them. Seek legal advice to ensure you understand the terms and conditions.</p>
        
        <h2>Property Rights</h2>
        <p>Understanding your property rights is essential. This includes knowing about easements, liens, and zoning restrictions.</p>
        
        <h2>Disclosures</h2>
        <p>Be transparent about any known defects or issues with the property. Failure to disclose relevant information can lead to legal disputes.</p>
        
        <h2>Insurance</h2>
        <p>Maintain appropriate insurance coverage to protect your property from damage or liability. Review your policy regularly to ensure it meets your needs.</p>
        
        <p>Legal issues can be complex, so it's advisable to seek advice from a real estate law professional. Being informed and proactive can help you avoid legal problems and protect your investment.</p>
      `,
      source: "Holibayt Legal Guide",
      tags: ["Legal", "Real Estate", "Contracts", "Property Rights"]
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(id || ""));

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="font-inter mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToBlog')}
          </Button>
        </div>

        {/* Hero Image */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-playfair">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 font-inter">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground font-inter border-b border-border pb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="mr-4">{post.author}</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{post.date}</span>
              </div>
              <div className="text-xs">
                Source: {post.source}
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div 
            className="prose prose-lg max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 font-playfair">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-inter">
                  {tag}
                </Badge>
              ))}
            </div>

            <BlogSocialShare title={post.title} />
            
            <BlogComments blogPostId={id || ''} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
