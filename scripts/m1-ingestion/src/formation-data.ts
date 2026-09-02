export interface M1FormationLessonRecord {
  title: string;
  slug: string;
  lessonOrder: number;
  summary: string;
  bodyText: string;
  catechismEntrySlug?: string;
  churchDocumentSlug?: string;
}

export interface M1FormationModuleRecord {
  title: string;
  slug: string;
  moduleOrder: number;
  summary: string;
  lessons: M1FormationLessonRecord[];
}

export interface M1FormationPathwayRecord {
  title: string;
  slug: string;
  summary: string;
  description: string;
  estimatedHours: number;
  modules: M1FormationModuleRecord[];
}

export const M1_FORMATION_PATHWAYS: M1FormationPathwayRecord[] = [
  {
    title: 'Introduction to Catholic Theology & Doctrine',
    slug: 'introduction-to-catholic-theology',
    summary: 'A foundational Catholic formation pathway exploring divine revelation, sacred tradition, the holy mystery of the Trinity, and the Paschal Mystery.',
    description: 'Designed for seekers, catechumens, and faithful Catholics seeking a structured understanding of Catholic doctrine grounded in Sacred Scripture, the Catechism of the Catholic Church, and Sacred Tradition.',
    estimatedHours: 6,
    modules: [
      {
        title: 'Module 1 — Faith & Divine Revelation',
        slug: 'faith-and-divine-revelation',
        moduleOrder: 1,
        summary: 'Explore how God reveals Himself to humanity through natural reason, divine revelation, and Holy Scripture.',
        lessons: [
          {
            title: 'Lesson 1.1 — The Natural Desire for God',
            slug: 'the-natural-desire-for-god',
            lessonOrder: 1,
            summary: 'Understanding the human heart’s innate longing for the Creator.',
            bodyText: 'Every human person possesses an inherent desire for happiness and truth that points beyond temporal realities to God. St. Augustine famously declared: "You have made us for Yourself, O Lord, and our hearts are restless until they rest in You." Through natural reason, man can discern the existence of God from the order and beauty of creation.',
            catechismEntrySlug: 'the-desire-for-god-ccc-27-30',
          },
          {
            title: 'Lesson 1.2 — Scripture and Sacred Tradition',
            slug: 'scripture-and-sacred-tradition',
            lessonOrder: 2,
            summary: 'The single sacred deposit of the Word of God entrusted to the Church.',
            bodyText: 'Divine Revelation is communicated through a single sacred deposit of faith comprising Sacred Scripture and Sacred Tradition. Handed down from the Apostles through episcopal succession, the Word of God is authentically interpreted by the living Magisterium of the Catholic Church.',
            churchDocumentSlug: 'dei-verbum',
            catechismEntrySlug: 'divine-revelation-ccc-50-53',
          },
          {
            title: 'Lesson 1.3 — The Mystery of the Holy Trinity',
            slug: 'the-mystery-of-the-holy-trinity',
            lessonOrder: 3,
            summary: 'The central mystery of Christian faith and life: One God in Three Divine Persons.',
            bodyText: 'The central mystery of Christian faith is the Holy Trinity: Father, Son, and Holy Spirit. God is not solitude, but an eternal communion of divine love. The Father generates the Son, the Son is begotten of the Father, and the Holy Spirit proceeds from the Father and the Son as eternal Love.',
          },
        ],
      },
      {
        title: 'Module 2 — Christology & The Redemption',
        slug: 'christology-and-redemption',
        moduleOrder: 2,
        summary: 'Examine the Incarnation of Our Lord Jesus Christ and His saving Paschal Mystery.',
        lessons: [
          {
            title: 'Lesson 2.1 — The Word Made Flesh: Incarnation',
            slug: 'the-word-made-flesh-incarnation',
            lessonOrder: 1,
            summary: 'The Mystery of God becoming Man in the Virgin Mary’s womb.',
            bodyText: 'In the fullness of time, God sent His Son, born of a woman. The Incarnation is the mystery of the hypostatic union: Jesus Christ is true God and true Man, possessing two natures without confusion, change, division, or separation.',
          },
          {
            title: 'Lesson 2.2 — The Paschal Mystery of Christ',
            slug: 'the-paschal-mystery-of-christ',
            lessonOrder: 2,
            summary: 'Christ’s redemptive Death, glorious Resurrection, and Ascension.',
            bodyText: 'By His holy Passion and Cross, Christ redeemed the world, conquering sin and death. His bodily Resurrection on the third day is the guarantee of our own bodily resurrection and the foundation of Christian hope.',
            catechismEntrySlug: 'the-paschal-mystery-ccc-571-573',
          },
          {
            title: 'Lesson 2.3 — The Mystery of the Catholic Church',
            slug: 'the-mystery-of-the-catholic-church',
            lessonOrder: 3,
            summary: 'The Church as the Mystical Body of Christ and Sacrament of Salvation.',
            bodyText: 'Founded by Jesus Christ upon the Apostle Peter, the Catholic Church is One, Holy, Catholic, and Apostolic. She is the Mystical Body of Christ, carrying out Christ’s saving mission to the ends of the earth.',
            churchDocumentSlug: 'lumen-gentium',
          },
        ],
      },
    ],
  },
  {
    title: 'The Holy Sacrifice of the Mass & Sacraments',
    slug: 'the-mass-and-sacraments',
    summary: 'A structured pathway into the sacramental liturgy, Eucharistic theology, and the seven Sacraments of the Church.',
    description: 'Walk step-by-step through the Eucharistic Liturgy of the Word and Liturgy of the Eucharist, exploring the biblical foundations and spiritual power of Holy Communion and the Sacramental Economy.',
    estimatedHours: 5,
    modules: [
      {
        title: 'Module 1 — Sacramental Grace & Liturgy',
        slug: 'sacramental-grace-and-liturgy',
        moduleOrder: 1,
        summary: 'Understanding sacraments as efficacy signs of grace instituted by Christ.',
        lessons: [
          {
            title: 'Lesson 1.1 — The Sacramental Principle',
            slug: 'the-sacramental-principle',
            lessonOrder: 1,
            summary: 'How physical signs communicate divine grace to human souls.',
            bodyText: 'Sacraments are outward signs instituted by Christ to give grace. Through visible symbols—water, oil, bread, wine, laying on of hands—the Holy Spirit confers invisible sanctifying grace upon the soul.',
            catechismEntrySlug: 'the-sacramental-economy-ccc-1066-1070',
            churchDocumentSlug: 'sacrosanctum-concilium',
          },
          {
            title: 'Lesson 1.2 — The Real Presence in the Eucharist',
            slug: 'the-real-presence-in-the-eucharist',
            lessonOrder: 2,
            summary: 'Transubstantiation: The Body, Blood, Soul, and Divinity of Jesus Christ.',
            bodyText: 'In the Most Holy Eucharist, under the species of bread and wine, Our Lord Jesus Christ is truly, really, and substantially present. Through transubstantiation at the consecration, the entire substance of bread becomes Christ’s Body, and the substance of wine becomes His Precious Blood.',
            catechismEntrySlug: 'the-holy-sacrifice-of-the-eucharist-ccc-1322-1327',
          },
          {
            title: 'Lesson 1.3 — The Order of the Mass Explained',
            slug: 'the-order-of-the-mass-explained',
            lessonOrder: 3,
            summary: 'Understanding the rites, prayers, and Scripture readings of the Holy Mass.',
            bodyText: 'The Holy Mass comprises two main parts forming one single act of worship: the Liturgy of the Word and the Liturgy of the Eucharist. In the Liturgy of the Word, God speaks to His people through Scripture readings and the Gospel. In the Liturgy of the Eucharist, Christ’s sacrifice on Calvary is made unbloodily present on the altar.',
          },
        ],
      },
      {
        title: 'Module 2 — Sacraments of Healing & Service',
        slug: 'sacraments-of-healing-and-service',
        moduleOrder: 2,
        summary: 'Explore Penance, Anointing of the Sick, Holy Orders, and Holy Matrimony.',
        lessons: [
          {
            title: 'Lesson 2.1 — Reconciliation & Penance',
            slug: 'reconciliation-and-penance',
            lessonOrder: 1,
            summary: 'Healing the soul through sacramental confession and divine forgiveness.',
            bodyText: 'Instituted by Christ when He breathed on the Apostles saying, "Whose sins you forgive are forgiven," the Sacrament of Penance restores sanctifying grace lost through mortal sin and grants spiritual strength against temptation.',
          },
          {
            title: 'Lesson 2.2 — Holy Matrimony & Family Life',
            slug: 'holy-matrimony-and-family-life',
            lessonOrder: 2,
            summary: 'The sacred covenant between a man and a woman in Christ.',
            bodyText: 'Holy Matrimony is a sacred covenant by which a baptized man and woman establish a lifelong partnership of life and love, ordered toward the good of the spouses and the procreation and education of children.',
            churchDocumentSlug: 'patris-corde',
          },
          {
            title: 'Lesson 2.3 — Holy Orders & Priesthood',
            slug: 'holy-orders-and-priesthood',
            lessonOrder: 3,
            summary: 'The ordained ministry of Bishops, Priests, and Deacons.',
            bodyText: 'Through the Sacrament of Holy Orders, ordained ministers are consecrated in the person of Christ the Head to shepherd the faithful, preach the Gospel, and offer the Sacraments.',
          },
        ],
      },
    ],
  },
  {
    title: 'Catholic Spiritual Life & Prayer',
    slug: 'catholic-spiritual-life-and-prayer',
    summary: 'A practical spiritual guide to mental prayer, lectio divina, Marian devotions, and growth in Christian virtue.',
    description: 'Learn the classical Catholic stages of prayer from vocal prayer to meditation and contemplation, rooted in the teachings of Saint Teresa of Avila, Saint John of the Cross, and Saint Ignatius of Loyola.',
    estimatedHours: 4,
    modules: [
      {
        title: 'Module 1 — Foundations of Christian Prayer',
        slug: 'foundations-of-christian-prayer',
        moduleOrder: 1,
        summary: 'The nature, necessity, and methods of personal Catholic prayer.',
        lessons: [
          {
            title: 'Lesson 1.1 — What is Catholic Prayer?',
            slug: 'what-is-catholic-prayer',
            lessonOrder: 1,
            summary: 'Lifting the mind and heart to God in faith, hope, and charity.',
            bodyText: 'Prayer is the raising of one’s mind and heart to God or the requesting of good things from God. It is a covenant relationship between God and man in Christ.',
            catechismEntrySlug: 'what-is-prayer-ccc-2558-2565',
          },
          {
            title: 'Lesson 1.2 — The Lord’s Prayer: Pattern of All Prayer',
            slug: 'the-lords-prayer-pattern-of-all-prayer',
            lessonOrder: 2,
            summary: 'How Jesus taught His disciples to pray the Our Father.',
            bodyText: 'Given directly by Christ, the Lord’s Prayer contains seven petitions covering all spiritual and physical necessities, teaching us to seek God’s kingdom first.',
            catechismEntrySlug: 'the-lords-prayer-summary-gospel-ccc-2761-2766',
          },
          {
            title: 'Lesson 1.3 — Lectio Divina: Praying with Scripture',
            slug: 'lectio-divina-praying-with-scripture',
            lessonOrder: 3,
            summary: 'The ancient monastic practice of reading, meditating, praying, and contemplating Scripture.',
            bodyText: 'Lectio Divina is a traditional practice of scriptural reading, meditation, and prayer intended to promote communion with God and to increase knowledge of God’s Word.',
          },
        ],
      },
    ],
  },
];
