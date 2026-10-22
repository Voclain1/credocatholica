import { CatechismPillar, DocumentType } from '@/generated/prisma/client';

export interface M1CatechismRecord {
  title: string;
  slug: string;
  paragraphStart: number;
  paragraphEnd: number;
  pillar: CatechismPillar;
  doctrinalLevel?: string;
  magisterialWeight?: string;
  councilSource?: string;
  bodyText: string;
  sourceUrl?: string;
}

export interface M1ChurchDocumentRecord {
  title: string;
  latinTitle?: string;
  slug: string;
  documentType: DocumentType;
  promulgationDate?: string;
  issuingAuthority: string;
  officialUrl?: string;
  summary: string;
  bodyText: string;
}

export const M1_CATECHISM_ENTRIES: M1CatechismRecord[] = [
  {
    title: 'The Desire for God (CCC 27-30)',
    slug: 'the-desire-for-god-ccc-27-30',
    paragraphStart: 27,
    paragraphEnd: 30,
    pillar: 'PART_1_PROFESSION_OF_FAITH',
    doctrinalLevel: 'Dogmatic Principle',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Second Vatican Council (Gaudium et Spes §19)',
    bodyText: 'The desire for God is written in the human heart, because man is created by God and for God; and God never ceases to draw man to himself. Only in God will he find the truth and happiness he never stops searching for.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P9.HTM',
  },
  {
    title: 'Ways of Knowing God (CCC 31-35)',
    slug: 'ways-of-knowing-god-ccc-31-35',
    paragraphStart: 31,
    paragraphEnd: 35,
    pillar: 'PART_1_PROFESSION_OF_FAITH',
    doctrinalLevel: 'Dogmatic Principle',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'First Vatican Council (Dei Filius c. 2)',
    bodyText: 'Created in God’s image and called to know and love him, the person who seeks God discovers certain ways of coming to know him. These are also called proofs for the existence of God, not in the sense of proofs in the natural sciences, but in the sense of converging and convincing arguments.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__PA.HTM',
  },
  {
    title: 'Divine Revelation (CCC 50-53)',
    slug: 'divine-revelation-ccc-50-53',
    paragraphStart: 50,
    paragraphEnd: 53,
    pillar: 'PART_1_PROFESSION_OF_FAITH',
    doctrinalLevel: 'Dogmatic Constitution',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Second Vatican Council (Dei Verbum §2)',
    bodyText: 'By natural reason man can know God with certainty, on the basis of his works. But there is another order of knowledge, which man cannot possibly arrive at by his own powers: the order of divine Revelation. By an utterly free decision, God has revealed himself and given himself to man.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__PF.HTM',
  },
  {
    title: 'The Paschal Mystery (CCC 571-573)',
    slug: 'the-paschal-mystery-ccc-571-573',
    paragraphStart: 571,
    paragraphEnd: 573,
    pillar: 'PART_1_PROFESSION_OF_FAITH',
    doctrinalLevel: 'Central Mystery of Faith',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Council of Trent (Sess. VI)',
    bodyText: 'The Paschal mystery of Christ’s cross and Resurrection stands at the center of the Good News that the apostles, and the Church after them, are to proclaim to the world. God’s saving plan was accomplished once for all by the redemptive death of his Son Jesus Christ.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P1O.HTM',
  },
  {
    title: 'The Sacramental Economy (CCC 1066-1070)',
    slug: 'the-sacramental-economy-ccc-1066-1070',
    paragraphStart: 1066,
    paragraphEnd: 1070,
    pillar: 'PART_2_SACRAMENTS',
    doctrinalLevel: 'Liturgical Theology',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Second Vatican Council (Sacrosanctum Concilium §7)',
    bodyText: 'The Church celebrates in her liturgy above all the Paschal mystery by which Christ accomplished the work of our salvation. It is this mystery of Christ that the Church proclaims and celebrates in her liturgy so that the faithful may live from it and bear witness to it in the world.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P2V.HTM',
  },
  {
    title: 'The Holy Sacrifice of the Eucharist (CCC 1322-1327)',
    slug: 'the-holy-sacrifice-of-the-eucharist-ccc-1322-1327',
    paragraphStart: 1322,
    paragraphEnd: 1327,
    pillar: 'PART_2_SACRAMENTS',
    doctrinalLevel: 'Source and Summit of Christian Life',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Second Vatican Council (Lumen Gentium §11)',
    bodyText: 'The Holy Eucharist completes Christian initiation. The Eucharist is the source and summit of the Christian life. The other sacraments, and indeed all ecclesiastical ministries and works of the apostolate, are bound up with the Eucharist and are oriented toward it.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P3W.HTM',
  },
  {
    title: 'Man’s Vocation to Life in the Spirit (CCC 1691-1696)',
    slug: 'mans-vocation-life-in-spirit-ccc-1691-1696',
    paragraphStart: 1691,
    paragraphEnd: 1696,
    pillar: 'PART_3_LIFE_IN_CHRIST',
    doctrinalLevel: 'Moral Theology',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Second Vatican Council (Gaudium et Spes §22)',
    bodyText: 'Recognize your dignity, O Christian, and now that you share in God’s own nature, do not return to your former base condition by sinning. Remember who is your head and of whose body you are a member.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P5G.HTM',
  },
  {
    title: 'The Ten Commandments (CCC 2052-2055)',
    slug: 'the-ten-commandments-ccc-2052-2055',
    paragraphStart: 2052,
    paragraphEnd: 2055,
    pillar: 'PART_3_LIFE_IN_CHRIST',
    doctrinalLevel: 'Moral Law',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Council of Trent (Sess. VI c. 19)',
    bodyText: 'Teacher, what good deed must I do, to have eternal life? To the young man who asked this question, Jesus answers first by invoking the necessity, recognized by all Jews, of acknowledging God as the unique Good, and then by telling him: "If you would enter life, keep the commandments."',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P74.HTM',
  },
  {
    title: 'What is Prayer? (CCC 2558-2565)',
    slug: 'what-is-prayer-ccc-2558-2565',
    paragraphStart: 2558,
    paragraphEnd: 2565,
    pillar: 'PART_4_CHRISTIAN_PRAYER',
    doctrinalLevel: 'Spiritual Theology',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'St. Thérèse of Lisieux & St. John Damascene',
    bodyText: 'Great is the mystery of the faith! The Church professes this mystery in the Apostles’ Creed and celebrates it in the sacramental liturgy, so that the life of the faithful may be conformed to Christ in the Holy Spirit to the glory of God the Father. This mystery, then, requires that the faithful believe in it, celebrate it, and live from it in a vital and personal relationship with the living and true God. This relationship is prayer.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P90.HTM',
  },
  {
    title: 'The Lord’s Prayer: Summary of the Gospel (CCC 2761-2766)',
    slug: 'the-lords-prayer-summary-gospel-ccc-2761-2766',
    paragraphStart: 2761,
    paragraphEnd: 2766,
    pillar: 'PART_4_CHRISTIAN_PRAYER',
    doctrinalLevel: 'Spiritual Theology',
    magisterialWeight: 'Universal Catechism',
    councilSource: 'Tertullian (De oratione 1) & St. Augustine',
    bodyText: 'The Lord’s Prayer is truly the summary of the whole Gospel. When the Lord had given us this prayer formula, he added: "Ask and you will receive." Everyone can therefore offer up different prayers according to his needs, but always beginning with the Lord’s Prayer.',
    sourceUrl: 'https://www.vatican.va/archive/ENG0015/__P9X.HTM',
  },
];

export const M1_CHURCH_DOCUMENTS: M1ChurchDocumentRecord[] = [
  {
    title: 'Lumen Gentium (Dogmatic Constitution on the Church)',
    latinTitle: 'Lumen Gentium',
    slug: 'lumen-gentium',
    documentType: 'COUNCIL_CONSTITUTION',
    promulgationDate: '1964-11-21',
    issuingAuthority: 'Second Vatican Council / Pope Paul VI',
    officialUrl: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_en.html',
    summary: 'The Dogmatic Constitution on the Church promulgated by Pope Paul VI at the Second Vatican Council, defining the nature of the Church as the People of God, the universal call to holiness, and the role of the Blessed Virgin Mary.',
    bodyText: 'Christ is the Light of nations. Because this is so, this Sacred Synod gathered together in the Holy Spirit eagerly desires, by proclaiming the Gospel to every creature, to bring the light of Christ to all men, a light brightly visible on the countenance of the Church.',
  },
  {
    title: 'Dei Verbum (Dogmatic Constitution on Divine Revelation)',
    latinTitle: 'Dei Verbum',
    slug: 'dei-verbum',
    documentType: 'COUNCIL_CONSTITUTION',
    promulgationDate: '1965-11-18',
    issuingAuthority: 'Second Vatican Council / Pope Paul VI',
    officialUrl: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_en.html',
    summary: 'The Dogmatic Constitution on Divine Revelation, establishing the divine inspiration of Holy Scripture, the sacred unity of Tradition and Scripture, and the authentic interpretation of the Magisterium.',
    bodyText: 'Hearing the word of God with reverence and proclaiming it with faith, the sacred synod takes its direction from these words of St. John: "We announce to you the eternal life which dwelt with the Father and was made visible to us."',
  },
  {
    title: 'Sacrosanctum Concilium (Constitution on the Sacred Liturgy)',
    latinTitle: 'Sacrosanctum Concilium',
    slug: 'sacrosanctum-concilium',
    documentType: 'COUNCIL_CONSTITUTION',
    promulgationDate: '1963-12-04',
    issuingAuthority: 'Second Vatican Council / Pope Paul VI',
    officialUrl: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_en.html',
    summary: 'The Constitution on the Sacred Liturgy, setting forth principles for liturgical renewal, the noble simplicity of the Roman Rite, and the active participation of the faithful in the Eucharist.',
    bodyText: 'This sacred Council has several aims in view: it desires to impart an ever increasing vigor to the Christian life of the faithful; to adapt more suitably to the needs of our own times those institutions which are subject to change; to foster whatever can promote union among all who believe in Christ.',
  },
  {
    title: 'Fidei Depositum (Apostolic Constitution on the Publication of the Catechism)',
    latinTitle: 'Fidei Depositum',
    slug: 'catechism-of-the-catholic-church',
    documentType: 'APOSTOLIC_CONSTITUTION',
    promulgationDate: '1992-10-11',
    issuingAuthority: 'Pope John Paul II',
    officialUrl: 'https://www.vatican.va/content/john-paul-ii/en/apost_constitutions/documents/hf_jp-ii_apc_19921011_fidei-depositum.html',
    summary: 'The Apostolic Constitution Fidei Depositum promulgated by Pope John Paul II for the publication of the Catechism of the Catholic Church prepared following the Second Vatican Ecumenical Council.',
    bodyText: 'Guarding the deposit of faith is the mission which the Lord entrusted to his Church, and which she fulfills in every age. The Second Vatican Ecumenical Council aimed to shine forth the truth of the Gospel to all nations.',
  },
  {
    title: 'Patris Corde (With a Father’s Heart)',
    latinTitle: 'Patris Corde',
    slug: 'patris-corde',
    documentType: 'APOSTOLIC_LETTER',
    promulgationDate: '2020-12-08',
    issuingAuthority: 'Pope Francis',
    officialUrl: 'https://www.vatican.va/content/francesco/en/apost_letters/documents/papa-francesco-lettera-ap_20201208_patris-corde.html',
    summary: 'Apostolic Letter of Pope Francis on the 150th Anniversary of the Proclamation of Saint Joseph as Patron of the Universal Church, declaring the Year of Saint Joseph.',
    bodyText: 'WITH A FATHER’S HEART: that is how Joseph loved Jesus, whom all four Gospels refer to as "the son of Joseph". Matthew and Luke, who speak most of Joseph, tell us little, yet enough for us to appreciate what sort of father he was, and the mission entrusted to him by God’s providence.',
  },
];
