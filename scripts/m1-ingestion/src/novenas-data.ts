import { M1RightsStatus } from './prayers-data.js';

export interface M1NovenaDayRecord {
  dayNumber: number;
  title: string;
  intention: string;
  prayerText: string;
  reflectionText?: string;
}

export interface M1NovenaRecord {
  title: string;
  slug: string;
  summary: string;
  openingPrayer?: string;
  closingPrayer?: string;
  historicalOrigin?: string;
  saintSlug?: string;
  sourceProvenance: string;
  // Machine-readable Rights Metadata Matrix
  rightsStatus: M1RightsStatus;
  exactSource: string;
  sourceOrganization: string;
  textVersionSelected: string;
  publicationDate?: string;
  reviewNote: string;
  days: M1NovenaDayRecord[];
}

export const M1_NOVENAS: M1NovenaRecord[] = [
  {
    title: 'Novena to the Holy Spirit',
    slug: 'novena-to-the-holy-spirit',
    summary: 'A nine-day devotion to the Holy Spirit before Pentecost.',
    openingPrayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen. O Holy Spirit, divine Paraclete, Father of the poor, Comforter of the afflicted, and Sanctifier of souls, come down into our hearts.',
    closingPrayer: 'Holy Spirit, Spirit of Truth, come into our hearts; shed the brightness of Thy light on all nations, that they may be one in faith and pleasing to Thee. Amen.',
    historicalOrigin: 'In Divinum illud munus, dated 9 May 1897, Pope Leo XIII directs a novena to the Holy Spirit before Pentecost in parish churches. This establishes historical context, not the wording of the prayers stored here.',
    sourceProvenance: 'Historical context: Divinum illud munus (9 May 1897), https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_09051897_divinum-illud-munus.html. The claimed CTS manual and stored prayer wording have not been verified.',
    rightsStatus: 'REQUIRES_RIGHTS_REVIEW',
    exactSource: 'Divinum illud munus (9 May 1897): historical context only; prayer wording unverified',
    sourceOrganization: 'Holy See (encyclical only); prayer edition unverified',
    textVersionSelected: 'Unverified prayer transcription',
    reviewNote: 'The claimed CTS edition and stored prayer wording require verification. Do not publish as the original novena text.',
    days: [
      {
        dayNumber: 1,
        title: 'Day 1 — The Gift of Holy Fear',
        intention: 'For a deep reverence towards God and fear of offending His Divine Majesty.',
        prayerText: 'O Almighty and Eternal God, Who hast vouchsafed to regenerate us by water and the Holy Spirit, grant us the Spirit of the Fear of the Lord, that we may walk in Thy commandments with holy reverence.',
        reflectionText: 'Holy Fear is not a slavish terror, but a filial awe that dreads offending Our Heavenly Father.'
      },
      {
        dayNumber: 2,
        title: 'Day 2 — The Gift of Piety',
        intention: 'For true devotion to God and love for our neighbors.',
        prayerText: 'Come, O Spirit of Piety, possess our hearts; incline our wills to true worship and filial love towards God our Father, and true fraternity towards all His children.',
        reflectionText: 'Piety unites our soul to God in trustful confidence as beloved children.'
      },
      {
        dayNumber: 3,
        title: 'Day 3 — The Gift of Fortitude',
        intention: 'For strength to bear daily crosses and overcome temptation.',
        prayerText: 'Come, O Spirit of Fortitude, uphold our souls in times of trial and adversity; grant us spiritual courage to resist evil and persevere unto the end.',
        reflectionText: 'Fortitude imparts divine vigour to the soul to endure trials for the glory of God.'
      },
      {
        dayNumber: 4,
        title: 'Day 4 — The Gift of Knowledge',
        intention: 'For spiritual discernment to see the true value of earthly things.',
        prayerText: 'Come, O Spirit of Knowledge, teach us the vanity of worldly illusions; enlighten our minds to perceive divine truths and walk in the light of Christ.',
        reflectionText: 'Knowledge enables us to judge created things according to their divine purpose.'
      },
      {
        dayNumber: 5,
        title: 'Day 5 — The Gift of Understanding',
        intention: 'For a deeper insight into the sacred mysteries of our Holy Faith.',
        prayerText: 'Come, O Spirit of Understanding, illuminate our minds to penetrate the sacred mysteries of the Gospel, that we may believe with vibrant faith.',
        reflectionText: 'Understanding illumines the mind to grasp revealed truths with spiritual clarity.'
      },
      {
        dayNumber: 6,
        title: 'Day 6 — The Gift of Counsel',
        intention: 'For divine guidance in all choices and moral decisions.',
        prayerText: 'Come, O Spirit of Counsel, guide our steps in every doubt and decision; grant us wisdom to choose what is pleasing to Thy Holy Will.',
        reflectionText: 'Counsel directs the practical intellect to act righteously under divine light.'
      },
      {
        dayNumber: 7,
        title: 'Day 7 — The Gift of Wisdom',
        intention: 'For the highest gift of contemplating divine things.',
        prayerText: 'Come, O Spirit of Wisdom, detach our hearts from earthly vanity and fill us with desire for heavenly realities, that we may relish the things of God.',
        reflectionText: 'Wisdom encompasses all gifts, allowing the soul to experience God as supreme Good.'
      },
      {
        dayNumber: 8,
        title: 'Day 8 — The Fruits of the Holy Spirit',
        intention: 'For the abundant harvest of charity, joy, peace, and holiness in our lives.',
        prayerText: 'O Divine Spirit, adorn our souls with Thy holy fruits of charity, joy, peace, patience, benignity, goodness, long-suffering, mildness, faith, modesty, continency, and chastity.',
        reflectionText: 'The fruits of the Spirit manifest the supernatural beauty of a soul indwelt by God.'
      },
      {
        dayNumber: 9,
        title: 'Day 9 — The Outpouring of Pentecost',
        intention: 'For a renewed Pentecost in our hearts, families, and the Holy Church.',
        prayerText: 'O Holy Paraclete, send down Thy divine flames upon us; renew the face of the earth and fill Thy Holy Catholic Church with apostolic fire, love, and truth.',
        reflectionText: 'Pentecost is the perpetual birthday of the Church, animating her mission until the end of time.'
      }
    ]
  },
  {
    title: 'Divine Mercy Novena',
    slug: 'divine-mercy-novena',
    summary: 'The nine-day novena dictated by Our Lord Jesus Christ to Saint Maria Faustina Kowalska, bringing distinct groups of souls to the abyss of His mercy each day.',
    openingPrayer: 'You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, enfold the whole world and empty Yourself out upon us.',
    closingPrayer: 'O Blood and Water, which gushed forth from the Heart of Jesus as a fount of mercy for us, I trust in You! Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world. Amen.',
    historicalOrigin: 'Dictated by Our Lord to Saint Faustina Kowalska in 1937, published in her Diary (Divine Mercy in My Soul).',
    saintSlug: 'saint-faustina-kowalska',
    sourceProvenance: 'Diary of Saint Maria Faustina Kowalska (Divine Mercy in My Soul). Translation by Marian Fathers of the Immaculate Conception.',
    rightsStatus: 'REQUIRES_RIGHTS_REVIEW',
    exactSource: 'Diary of Saint Maria Faustina Kowalska (Stockbridge, MA: Marian Press)',
    sourceOrganization: 'Congregation of Marian Fathers of the Immaculate Conception',
    textVersionSelected: 'English Diary Translation (George Kosicki, C.S.B. / Marian Press edition)',
    publicationDate: '1987 (Translation)',
    reviewNote: 'REQUIRES RIGHTS REVIEW. While Saint Faustina’s original Polish revelations are sacred Church heritage, the copyrighted English translation of the Diary is owned by Marian Press (Stockbridge, MA). Retained in DEVELOPMENT explicitly flagged as REQUIRES_RIGHTS_REVIEW.',
    days: [
      {
        dayNumber: 1,
        title: 'Day 1 — All Mankind, Especially All Sinners',
        intention: 'For all mankind, especially all sinners.',
        prayerText: 'Most Merciful Jesus, Whose very nature it is to have compassion on us and to forgive us, do not look upon our sins but upon our trust which we place in Your infinite goodness. Receive us all into the abode of Your Most Compassionate Heart.'
      },
      {
        dayNumber: 2,
        title: 'Day 2 — The Souls of Priests and Religious',
        intention: 'For the souls of priests and religious.',
        prayerText: 'Most Merciful Jesus, from Whom comes all that is good, draw priests and consecrated religious into Your Heart. Grant them strength and light to lead others along the paths of salvation.'
      },
      {
        dayNumber: 3,
        title: 'Day 3 — All Devout and Faithful Souls',
        intention: 'For all devout and faithful souls.',
        prayerText: 'Most Merciful Jesus, Who bestow Your graces upon all in abundance, receive into the abode of Your Most Compassionate Heart all faithful Christians who console You on Your way of the Cross.'
      },
      {
        dayNumber: 4,
        title: 'Day 4 — Those Who Do Not Believe in God',
        intention: 'For those who do not believe in God and those who do not yet know Christ.',
        prayerText: 'Most Compassionate Jesus, You are the Light of the whole world. Receive into the abode of Your Most Compassionate Heart the souls of those who do not believe in God and those who do not yet know You.'
      },
      {
        dayNumber: 5,
        title: 'Day 5 — The Souls of Separated Brethren',
        intention: 'For the souls of separated brethren.',
        prayerText: 'Most Merciful Jesus, Who are Goodness Itself, draw into the light of Your Church the souls of our separated brethren, that they may be united with us under one Shepherd.'
      },
      {
        dayNumber: 6,
        title: 'Day 6 — The Meek and Humble Souls',
        intention: 'For the meek and humble souls and the souls of little children.',
        prayerText: 'Most Merciful Jesus, You Yourself have said, "Learn from Me, for I am meek and humble of heart." Receive into Your Heart all meek and humble souls and the souls of little children, who resemble Heaven most.'
      },
      {
        dayNumber: 7,
        title: 'Day 7 — Souls Who Especially Extol Divine Mercy',
        intention: 'For souls who especially venerate and glorify Your Mercy.',
        prayerText: 'Most Merciful Jesus, Whose Heart is Love Itself, receive into Your Heart the souls who particularly extol and venerate the greatness of Your mercy, making them living images of Your Compassionate Heart.'
      },
      {
        dayNumber: 8,
        title: 'Day 8 — The Souls in Purgatory',
        intention: 'For the souls detained in Purgatory.',
        prayerText: 'Most Merciful Jesus, You Yourself have said that You desire mercy; bring into the abode of Your Most Compassionate Heart the souls in Purgatory who are making expiation to Your justice.'
      },
      {
        dayNumber: 9,
        title: 'Day 9 — Souls Who Have Become Lukewarm',
        intention: 'For souls who have become lukewarm.',
        prayerText: 'Most Compassionate Jesus, You are Compassion Itself. Bring lukewarm souls into the abode of Your Most Compassionate Heart. In this fire of Your pure love, let these frozen souls be enkindled again.'
      }
    ]
  },
  {
    title: 'Novena to Saint Joseph',
    slug: 'novena-to-saint-joseph',
    summary: 'A nine-day petition to Saint Joseph, Protector of the Holy Church and Terror of Demons, for spiritual assistance, work, and family intentions.',
    openingPrayer: 'Saint Joseph, whose protection is so great, so strong, so prompt before the throne of God, I place in thee all my interests and desires.',
    closingPrayer: 'O Saint Joseph, assist me by thy powerful intercession and obtain for me from thy Divine Son all spiritual blessings through Jesus Christ Our Lord. Amen.',
    historicalOrigin: 'Traditional Catholic novena published in St. Joseph’s Manual (1921).',
    saintSlug: 'saint-joseph',
    sourceProvenance: 'St. Joseph’s Manual: Prayers and Devotions (Benziger Brothers, 1921).',
    rightsStatus: 'PUBLIC_DOMAIN_CONFIRMED',
    exactSource: 'St. Joseph’s Manual (Benziger Brothers, 1921)',
    sourceOrganization: 'Benziger Brothers',
    textVersionSelected: 'Traditional 1921 Benziger English Text',
    publicationDate: '1921',
    reviewNote: 'CONFIRMED PUBLIC DOMAIN. 1921 US publication; expired copyright.',
    days: [
      {
        dayNumber: 1,
        title: 'Day 1 — Saint Joseph, Foster-Father of Jesus',
        intention: 'For deep faith and trust in God’s fatherly providence.',
        prayerText: 'O Saint Joseph, faithful guardian of the Redeemer, obtain for us the grace to trust completely in Our Heavenly Father as thou didst in all trials.'
      },
      {
        dayNumber: 2,
        title: 'Day 2 — Saint Joseph, Spouse of the Virgin Mary',
        intention: 'For purity, holiness, and fidelity in Christian marriages.',
        prayerText: 'O chaste spouse of Mary, protect all Christian families; obtain for husbands and wives the grace of holy love and mutual sacrifice.'
      },
      {
        dayNumber: 3,
        title: 'Day 3 — Saint Joseph, Model of Laborers',
        intention: 'For dignity, honest employment, and sanctification through work.',
        prayerText: 'O Saint Joseph, carpenter of Nazareth, sanctify our daily work and assist all who seek honest employment to support their families.'
      },
      {
        dayNumber: 4,
        title: 'Day 4 — Saint Joseph, Head of the Holy Family',
        intention: 'For domestic peace and the protection of children.',
        prayerText: 'O guardian of the Holy Family, shield our homes from modern errors, infidelity, and discord; guide our children in holy virtue.'
      },
      {
        dayNumber: 5,
        title: 'Day 5 — Saint Joseph, Example of Silence and Prayer',
        intention: 'For the spirit of interior recollection and quiet prayer.',
        prayerText: 'O quiet saint of Nazareth, teach us to love interior silence, that we may hear the still small voice of God amidst worldly noise.'
      },
      {
        dayNumber: 6,
        title: 'Day 6 — Saint Joseph, Obedient Servant of God',
        intention: 'For prompt obedience to God’s holy commandments.',
        prayerText: 'O Joseph most obedient, who arose at midnight to flee into Egypt at the angel’s word, grant us prompt obedience to God’s Holy Will.'
      },
      {
        dayNumber: 7,
        title: 'Day 7 — Saint Joseph, Solace of the Afflicted',
        intention: 'For comfort in sorrow and strength in times of suffering.',
        prayerText: 'O saint of great trial, comfort all who suffer poverty, exile, or grief; obtain for them divine consolation and hope.'
      },
      {
        dayNumber: 8,
        title: 'Day 8 — Saint Joseph, Patron of the Dying',
        intention: 'For the grace of a holy death fortified by the Sacraments.',
        prayerText: 'O Joseph, who didst expire peacefully in the arms of Jesus and Mary, obtain for us the grace of a happy death fortified by Holy Viaticum.'
      },
      {
        dayNumber: 9,
        title: 'Day 9 — Saint Joseph, Terror of Demons and Protector of the Church',
        intention: 'For the Holy Father, the Catholic Church, and final perseverance.',
        prayerText: 'O Terror of Demons and Protector of the Holy Catholic Church, cast back the powers of darkness and preserve Holy Mother Church in unity and truth. Amen.'
      }
    ]
  },
  {
    title: 'Novena to Saint Jude Thaddeus',
    slug: 'novena-to-saint-jude',
    summary: 'Traditional nine-day novena to Saint Jude Thaddeus, Apostle and Patron of Hopeless Cases and Desperate Causes.',
    openingPrayer: 'Glorious Apostle, Saint Jude Thaddeus, true relative of Jesus and Mary, I salute thee through the Most Sacred Heart of Jesus.',
    closingPrayer: 'May the Most Sacred Heart of Jesus be praised, adored, glorified, and preserved throughout the world now and forever. Amen. Saint Jude, pray for us and hear our prayers. Amen.',
    historicalOrigin: 'Popularized by the League of Saint Jude (Chicago, 1929 publication).',
    saintSlug: 'saint-jude-thaddeus',
    sourceProvenance: 'Devotions to Saint Jude Thaddeus (Claretian Press, 1929).',
    rightsStatus: 'PUBLIC_DOMAIN_CONFIRMED',
    exactSource: 'Devotions to Saint Jude Thaddeus (Claretian Press, 1929)',
    sourceOrganization: 'Claretian Missionaries / League of Saint Jude',
    textVersionSelected: '1929 Traditional League of St. Jude Text',
    publicationDate: '1929',
    reviewNote: 'CONFIRMED PUBLIC DOMAIN. 1929 US publication; expired copyright.',
    days: [
      {
        dayNumber: 1,
        title: 'Day 1 — Saint Jude, Call of the Apostle',
        intention: 'For the grace to answer Christ’s call in our state of life.',
        prayerText: 'Saint Jude, who answered Jesus’ call to leave all things and follow Him, grant us the grace to follow Our Lord with generous hearts.'
      },
      {
        dayNumber: 2,
        title: 'Day 2 — Saint Jude, Martyr for Christ',
        intention: 'For courage to bear witness to the Catholic faith.',
        prayerText: 'Saint Jude, who shed thy blood for the Gospel in foreign lands, obtain for us holy fortitude to profess our faith without fear.'
      },
      {
        dayNumber: 3,
        title: 'Day 3 — Saint Jude, Hope of the Hopeless',
        intention: 'For relief in severe financial, physical, or spiritual crises.',
        prayerText: 'Saint Jude, patron of hopeless causes, look upon my present distress and obtain for me God’s miraculous aid in my petition.'
      },
      {
        dayNumber: 4,
        title: 'Day 4 — Saint Jude, Brother of the Lord',
        intention: 'For true fraternity and love within Christian families.',
        prayerText: 'Saint Jude, bound by holy ties of kinship to the Holy Family, intercede for peace, reconciliation, and salvation in all our families.'
      },
      {
        dayNumber: 5,
        title: 'Day 5 — Saint Jude, Intercessor for the Sick',
        intention: 'For healing of mind, body, and spirit.',
        prayerText: 'Saint Jude, through whose prayers God worked countless physical and spiritual healings, bring comfort to all who suffer illness.'
      },
      {
        dayNumber: 6,
        title: 'Day 6 — Saint Jude, Patron of Difficult Undertakings',
        intention: 'For guidance in complex problems and decisions.',
        prayerText: 'Saint Jude, advocate in intricate and difficult trials, enlighten our intellects to see the path of duty and godliness.'
      },
      {
        dayNumber: 7,
        title: 'Day 7 — Saint Jude, Defender of the True Faith',
        intention: 'For perseverance against heresy, doubt, and despair.',
        prayerText: 'Saint Jude, author of the Canonical Epistle warning against false teachers, keep us anchored in the eternal truth of Holy Mother Church.'
      },
      {
        dayNumber: 8,
        title: 'Day 8 — Saint Jude, Consoler of the Depressed',
        intention: 'For freedom from anxiety, depression, and spiritual darkness.',
        prayerText: 'Saint Jude, light in darkness, bring divine joy and hope to all souls burdened by despair, anxiety, and heavy hearts.'
      },
      {
        dayNumber: 9,
        title: 'Day 9 — Saint Jude, Companion in Eternal Glory',
        intention: 'For the grace of final perseverance and eternal salvation.',
        prayerText: 'Saint Jude, crowned apostle in Heaven, intercede for us at the throne of God that we may join thee in eternal praise. Amen.'
      }
    ]
  },
  {
    title: 'Novena to Saint Thérèse of Lisieux',
    slug: 'novena-to-saint-therese',
    summary: 'The Rose Novena to Saint Thérèse of the Child Jesus, petitioning her for shower of roses—graces from Heaven.',
    openingPrayer: 'O Little Therese of the Child Jesus, please pick a rose for me from the heavenly gardens and send it to me as a message of love.',
    closingPrayer: 'Saint Therese, Little Flower of Jesus, pray for us that we may walk thy Little Way of trust and love unto eternal life. Amen.',
    historicalOrigin: 'Composed following her canonization (1925), published in Little Flower Prayer Book (1926).',
    saintSlug: 'saint-therese-of-lisieux',
    sourceProvenance: 'Little Flower Prayer Book (Carmelite Convent, 1926).',
    rightsStatus: 'PUBLIC_DOMAIN_CONFIRMED',
    exactSource: 'Little Flower Prayer Book (Carmelite Convent, 1926)',
    sourceOrganization: 'Discalced Carmelite Nuns',
    textVersionSelected: '1926 Carmelite English Text',
    publicationDate: '1926',
    reviewNote: 'CONFIRMED PUBLIC DOMAIN. 1926 US publication; expired copyright.',
    days: [
      {
        dayNumber: 1,
        title: 'Day 1 — Confidence in God’s Love',
        intention: 'For a childlike trust in God’s infinite mercy.',
        prayerText: 'Little Flower, who promised to spend thy Heaven doing good upon earth, obtain for us childlike confidence in God’s merciful love.'
      },
      {
        dayNumber: 2,
        title: 'Day 2 — The Little Way of Simplicity',
        intention: 'For simplicity of heart and freedom from pride.',
        prayerText: 'Saint Therese, teach us thy Little Way of doing small things with great love for Jesus, pleasing Our Heavenly Father.'
      },
      {
        dayNumber: 3,
        title: 'Day 3 — Love for the Holy Eucharist',
        intention: 'For deep Eucharistic devotion and reverence at Holy Mass.',
        prayerText: 'Saint Therese, who wept with joy at thy First Holy Communion, kindle in our hearts ardent love for Jesus in the Most Blessed Sacrament.'
      },
      {
        dayNumber: 4,
        title: 'Day 4 — Zeal for Priests and Missions',
        intention: 'For holy priests, missionaries, and the conversion of sinners.',
        prayerText: 'Saint Therese, patroness of Catholic missions, pray for all priests and heralds of the Gospel, that they may save countless souls.'
      },
      {
        dayNumber: 5,
        title: 'Day 5 — Patient Endurance of Suffering',
        intention: 'For grace to offer our daily sufferings in union with Christ.',
        prayerText: 'Saint Therese, who bore silent illness with joy for love of Jesus, help us embrace our daily crosses with patient resignation.'
      },
      {
        dayNumber: 6,
        title: 'Day 6 — Filial Devotion to Mary',
        intention: 'For true devotion to Our Blessed Mother.',
        prayerText: 'Saint Therese, who looked upon the Virgin Mary with childlike affection, obtain for us deep love for Our Heavenly Mother.'
      },
      {
        dayNumber: 7,
        title: 'Day 7 — Spirit of Gratitude',
        intention: 'For a heart filled with thanksgiving for all God’s gifts.',
        prayerText: 'Saint Therese, who saw every event as a gift of divine providence, grant us a grateful heart in all circumstances.'
      },
      {
        dayNumber: 8,
        title: 'Day 8 — Hope for Heaven',
        intention: 'For holy desire for our true home in Paradise.',
        prayerText: 'Saint Therese, whose last words were "My God, I love You!", keep our eyes fixed on Heaven, our true homeland.'
      },
      {
        dayNumber: 9,
        title: 'Day 9 — The Shower of Roses',
        intention: 'For the fulfillment of our spiritual petitions according to God’s Will.',
        prayerText: 'Saint Therese, shower down thy promised roses of grace upon our souls; present our prayers to Jesus and Mary. Amen.'
      }
    ]
  }
];
