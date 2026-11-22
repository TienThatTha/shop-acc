/**
 * Dữ liệu quảng bá chính thức cho trang giới thiệu game Mộng Thiên Cửu.
 * Tài nguyên hình ảnh được lấy từ /mtc-showcase/*.
 */

export const MTC_HERO_SLIDES = [
  {
    id: 'fox-spirit',
    image: '/mtc-showcase/hero_fox.jpg',
    tag: 'Khởi Nguyên Huyền Linh',
    title: 'Khế Ước Cửu Vĩ Hồ',
    subtitle: 'Đồng Hành Cùng Linh Thú Thượng Cổ',
    description:
      'Giữa thảo nguyên Bình An Trấn ngập ánh bình minh, thiếu niên kiếm khách lập khế ước huyết mạch với Cửu Vĩ Huyền Hồ — mở đầu hành trình hàng yêu trảm ma khắp Cửu Châu.',
  },
  {
    id: 'kitsune-moon',
    image: '/mtc-showcase/scene_palace.jpg',
    tag: 'Tuyệt Phẩm Hòa Phong',
    title: 'Thần Điện Hoàng Thành',
    subtitle: 'Tuyệt Mỹ Kiến Trúc Hòa Phong',
    description:
      'Đèn lồng đỏ rực rỡ cùng cánh phong bay khắp thánh điện uy nghi — nơi hội tụ anh tài Tứ Đại Hệ Phái chuẩn bị bước vào đại chiến liên minh.',
  },
  {
    id: 'thunder-duel',
    image: '/mtc-showcase/hero_duel.jpg',
    tag: 'Đỉnh Cao Luận Kiếm',
    title: 'Lôi Kiếm Tranh Phong',
    subtitle: 'Tuyệt Kỹ Liên Chiêu Mãn Nhãn',
    description:
      'Những pha giao phong nghẹt thở giữa Kiếm Sĩ và Lãng Khách trên chiến trường đền cổ. Làm chủ thời điểm né đòn, bộc phát lôi điện và tung tuyệt kỹ xoay chuyển càn khôn.',
  },
  {
    id: 'sakura-sanctuary',
    image: '/mtc-showcase/scene_sakura.jpg',
    tag: 'Thế Giới Mở Rộng Lớn',
    title: 'Thánh Địa Anh Đào Lạc Cảnh',
    subtitle: 'Thủy Mặc Kỳ Cảnh Hòa Phong',
    description:
      'Dạo bước qua cầu gỗ đỏ, đền thiêng u tịch và rừng hoa anh đào rơi lả tả. Khám phá từng bí ẩn ẩn giấu trong bức họa sơn hà đa tầng của Mộng Thiên Cửu.',
  },
  {
    id: 'spirit-awakening',
    image: '/mtc-showcase/hero_spirits.jpg',
    tag: 'Ngự Hồn Cộng Hưởng',
    title: 'Song Hồn Thức Tỉnh',
    subtitle: 'Triệu Hồi Ngự Hồn Tuyệt Phẩm',
    description:
      'Hợp lực cùng các Ngự Hồn mang mặt nạ Quỷ Dạ Xoa và kiếm khách tinh anh. Kết hợp nguyên tố Băng - Hỏa - Lôi để tạo nên đội hình bất khả chiến bại.',
  },
];

export const MTC_CLASSES = [
  {
    id: 'kiemsi',
    name: 'Kiếm Sĩ',
    element: 'Lôi • Phong',
    roleLabel: 'Công Cao • Đỡ Đòn',
    nameImg: '/mtc-showcase/class_kiemsi_name.png',
    roleImg: '/mtc-showcase/class_kiemsi_role.png',
    loreImg: '/mtc-showcase/class_kiemsi_lore.png',
    artworkImg: '/mtc-showcase/scene_nightstage.jpg',
    characterImg: '/mtc-showcase/char_kiemsi.png',
    portraitImg: '/mtc-showcase/portrait_kiemsi.png',
    loreText:
      'Đứa con thần sứ kiêu ngạo — ánh bình minh nơi tuyệt cảnh. Tu luyện kiếm đạo thượng cổ từ thuở thiếu thời, vung thanh lôi kiếm xé toạc màn sương yêu khí, vừa công kích áp đảo vừa hộ thuẫn vững vàng bảo vệ đồng đội.',
    weapon: 'Thái Đao Lôi Quang',
    difficulty: 'Cân Bằng • Dễ Làm Quen',
    accentFrom: 'from-sky-400',
    accentTo: 'to-amber-400',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-400/40',
    stats: {
      atk: 88,
      def: 84,
      burst: 82,
      control: 70,
      range: 60,
    },
    skills: [
      {
        name: 'Thanh Liên Trảm',
        desc: 'Chém ngang liên hoàn ba nhịp, tích tụ kiếm khí gây sát thương lôi quang diện rộng.',
      },
      {
        name: 'Hộ Thuẫn Kiếm Ý',
        desc: 'Dựng kết giới kiếm khí giảm sát thương gánh chịu và phản chấn kẻ địch áp sát.',
      },
      {
        name: 'Thiên Lôi Phá Trận',
        desc: 'Lao thẳng xuyên đội hình địch, triệu hồi sấm sét giáng xuống mục tiêu gây bạo kích lớn.',
      },
    ],
  },
  {
    id: 'vuco',
    name: 'Vũ Cơ',
    element: 'Ảo Ảnh • Hoa Vũ',
    roleLabel: 'Bộc Phát • Khống Chế',
    nameImg: '/mtc-showcase/class_vuco_name.png',
    roleImg: '/mtc-showcase/class_vuco_role.png',
    loreImg: '/mtc-showcase/class_vuco_lore.png',
    artworkImg: '/mtc-showcase/scene_sakura.jpg',
    characterImg: '/mtc-showcase/char_vuco.png',
    portraitImg: '/mtc-showcase/portrait_vuco.png',
    loreText:
      'Hậu duệ Cửu Vĩ ôn hòa — ẩn mình nơi danh môn. Mỗi bước vũ đạo giữa mưa hoa anh đào đều ẩn chứa huyễn thuật hồ tộc, dễ dàng trói chân quần địch và dồn sát thương bộc phát trong chớp mắt.',
    weapon: 'Yêu Đao & Phiến Hoa',
    difficulty: 'Trung Bình • Kỹ Thuật',
    accentFrom: 'from-rose-400',
    accentTo: 'to-fuchsia-500',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-400/40',
    stats: {
      atk: 86,
      def: 62,
      burst: 96,
      control: 92,
      range: 78,
    },
    skills: [
      {
        name: 'Anh Đào Mê Ảnh',
        desc: 'Tung cơn lốc cánh hoa anh đào làm choáng và giảm tốc toàn bộ mục tiêu trong vùng ảnh hưởng.',
      },
      {
        name: 'Cửu Vĩ Huyễn Vũ',
        desc: 'Giải phóng linh lực Cửu Vĩ xoay chuyển liên tục, gây sát thương bộc phát nhiều đợt.',
      },
      {
        name: 'Mộng Cảnh Đoạt Hồn',
        desc: 'Khóa chặt mục tiêu bằng ấn ký hồ yêu, tăng mạnh sát thương chí mạng khi kết liễu.',
      },
    ],
  },
  {
    id: 'thuongsu',
    name: 'Thương Sư',
    element: 'Hỏa Viêm • Thiết Giáp',
    roleLabel: 'Giáp Nặng • Hồi Phục',
    nameImg: '/mtc-showcase/class_thuongsu_name.png',
    roleImg: '/mtc-showcase/class_thuongsu_role.png',
    loreImg: '/mtc-showcase/class_thuongsu_lore.png',
    artworkImg: '/mtc-showcase/scene_palace.jpg',
    characterImg: '/mtc-showcase/char_thuongsu.png',
    portraitImg: '/mtc-showcase/portrait_thuongsu.png',
    loreText:
      'Hậu duệ danh tướng kiêu hãnh — ngọn lửa rực cháy trong đêm. Khoác chiến giáp bất khuất cùng trường thương rực lửa, tiên phong mở đường giữa vòng vây Đại Yêu và tự hồi phục bền bỉ qua mọi giao tranh.',
    weapon: 'Viêm Long Trường Thương',
    difficulty: 'Dễ • Tiên Phong Trụ Tuyến',
    accentFrom: 'from-amber-500',
    accentTo: 'to-rose-600',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
    stats: {
      atk: 78,
      def: 96,
      burst: 74,
      control: 80,
      range: 66,
    },
    skills: [
      {
        name: 'Phá Quân Đột Kích',
        desc: 'Xung phong hất tung hàng ngũ đối thủ và thiêu đốt bằng liệt hỏa trường thương.',
      },
      {
        name: 'Bất Diệt Chiến Hồn',
        desc: 'Kích hoạt huyết khí danh tướng giúp tăng kháng chịu và hồi phục sinh lực theo thời gian.',
      },
      {
        name: 'Hỏa Long Phần Thiên',
        desc: 'Xoay thương tạo vòng xoáy hỏa diễm, hút địch về tâm và gây sát thương liên tục.',
      },
    ],
  },
  {
    id: 'cungthu',
    name: 'Cung Thủ',
    element: 'Băng Tinh • Phong Tiễn',
    roleLabel: 'Tầm Xa • Bạo Kích',
    nameImg: '/mtc-showcase/class_cungthu_name.png',
    roleImg: '/mtc-showcase/class_cungthu_role.png',
    loreImg: '/mtc-showcase/class_cungthu_lore.png',
    artworkImg: '/mtc-showcase/scene_moonlake.jpg',
    characterImg: '/mtc-showcase/char_cungthu.png',
    portraitImg: '/mtc-showcase/portrait_cungthu.png',
    loreText:
      'Thiếu nữ Quỷ Tộc phóng khoáng — băng tinh nơi miền hoang dã. Bậc thầy tiễn thuật tầm xa mang dòng máu Băng Quỷ, tung mưa tiễn băng giá xuyên phá giáp trụ và kết liễu mục tiêu bằng những phát bắn chí mạng.',
    weapon: 'Băng Tinh Trường Cung',
    difficulty: 'Cao • Thiện Xạ Cơ Động',
    accentFrom: 'from-cyan-400',
    accentTo: 'to-emerald-500',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
    stats: {
      atk: 92,
      def: 56,
      burst: 94,
      control: 72,
      range: 98,
    },
    skills: [
      {
        name: 'Hàn Băng Liên Tiễn',
        desc: 'Bắn loạt tên băng tốc độ cao, làm chậm bước tiến kẻ địch và cộng dồn dấu ấn bạo kích.',
      },
      {
        name: 'Linh Bộ Thoát Thân',
        desc: 'Nhảy lùi linh hoạt né tránh khống chế đồng thời để lại bẫy sương giá cản đường.',
      },
      {
        name: 'Thiên Tinh Phá Giáp',
        desc: 'Tụ lực toàn phần bắn mũi tên băng tinh xuyên thấu, gây sát thương chuẩn cực đại.',
      },
    ],
  },
];

export const MTC_EVENT_BANNERS = [
  {
    id: 'tam-bao-trang-bi',
    title: 'Tầm Bảo Trang Bị',
    subtitle: 'Nhận Nhanh Trang Bị Hiếm Toàn Giới',
    tag: 'Kho Báu Bí Cảnh',
    image: '/mtc-showcase/banner_tambao.png',
    highlight: 'Quay tầm bảo mở khóa thần trang phẩm chất Đỏ & Hồng giúp bứt phá lực chiến ngay từ giai đoạn đầu.',
  },
  {
    id: 'x2-kinh-nghiem',
    title: 'Phúc Lợi x2 Kinh Nghiệm',
    subtitle: 'Tặng Sách Tăng Cấp Thần Tốc',
    tag: 'Tăng Tốc Tu Luyện',
    image: '/mtc-showcase/banner_x2exp.png',
    highlight: 'Nhân đôi lượng EXP khi săn quái và phó bản, kết hợp Sách Tăng Cấp giúp khai mở nhanh các tính năng cao cấp.',
  },
  {
    id: 'qua-3-ngay-than-khi',
    title: 'Chuỗi Quà 3 Ngày Đăng Nhập',
    subtitle: 'Tặng Thần Khí Vô Cấp Trấn Phái',
    tag: 'Quà Tân Thủ',
    image: '/mtc-showcase/banner_thankhi.png',
    highlight: 'Điểm danh đủ mốc 3 ngày đầu tiên nhận trọn bộ Thần Khí Vô Cấp phát sáng độc quyền cho cả Tứ Đại Hệ Phái.',
  },
  {
    id: 'chi-ton-dac-quyen',
    title: 'Đặc Quyền Quý Tộc V4',
    subtitle: 'Hưởng Đặc Quyền Quý Tộc Vĩnh Viễn',
    tag: 'Đặc Quyền Cao Cấp',
    image: '/mtc-showcase/banner_vip.png',
    highlight: 'Kích hoạt thẻ Quý Tộc V4: tăng lượt khiêu chiến phó bản, tỷ lệ rớt thần trang hiếm và phúc lợi độc quyền.',
  },
  {
    id: 'trieu-hoi-ngu-hon',
    title: 'Triệu Hồi Ngự Hồn',
    subtitle: 'Sở Hữu Ngự Hồn UR Tuyệt Phẩm',
    tag: 'Thức Thần UR',
    image: '/mtc-showcase/banner_nguhon.png',
    highlight: 'Triệu hồi các thẻ Ngự Hồn UR tuyệt mỹ với chỉ số Tuyệt Đối Công Kích, Phòng Ngự và Tỷ Lệ Hội Tâm cực cao.',
  },
  {
    id: 'tho-phuc-van',
    title: 'Thú Cưỡi Độc Quyền Lễ Hội',
    subtitle: 'Thỏ Phúc Vận Ra Mắt Có Hạn',
    tag: 'Tọa Kỵ Giới Hạn',
    image: '/mtc-showcase/banner_thucuoi.png',
    highlight: 'Tọa kỵ Thỏ Phúc Vận tay cầm đèn lồng hoa xuân mang lại tốc độ di chuyển vượt trội và ngoại trang nổi bật.',
  },
  {
    id: 'long-ngoc-1-sao',
    title: 'Long Ngọc 1 Sao Có Hạn',
    subtitle: 'Bảo Vật Không Thể Thiếu Khi Săn Boss',
    tag: 'Long Ngọc Khai Hồn',
    image: '/mtc-showcase/banner_longngoc1.png',
    highlight: 'Gia tăng mạnh sát thương lên Đại Yêu và Thủ Lĩnh Thế Giới, giúp tổ đội rút ngắn thời gian hạ gục Boss.',
  },
  {
    id: 'long-ngoc-4-sao',
    title: 'Long Ngọc 4 Sao Có Hạn',
    subtitle: 'Tuyệt Chiêu Lật Kèo Khi Thấp Máu',
    tag: 'Thần Ngọc PK',
    image: '/mtc-showcase/banner_longngoc4.png',
    highlight: 'Kích hoạt nội tại nghịch chuyển tình thế khi sinh lực xuống thấp, bùng nổ sát thương trong các trận PK đỉnh cao.',
  },
];

export const MTC_FEATURES_SHOWCASE = [
  {
    id: 'kim-phuc-manh-tru',
    title: 'Kim Phúc Manh Trư',
    levelReq: 'Đăng Nhập Ngày 2',
    category: 'social',
    categoryLabel: 'Nhân Duyên & Thời Trang',
    image: '/mtc-showcase/feat_manhtru.jpg',
    summary: 'Đăng nhập sang ngày thứ 2 nhận ngay tọa kỵ giới hạn Kim Phúc Manh Trư đáng yêu, tăng tốc độ hành tẩu và chỉ số cơ bản.',
  },
  {
    id: 'dai-yeu-di-vuc',
    title: 'Dị Vực — Săn Đại Yêu',
    levelReq: 'Cấp 95 • SV Ngày 2',
    category: 'boss',
    categoryLabel: 'Săn Boss Đại Yêu',
    image: '/mtc-showcase/feat_divuc.jpg',
    summary: 'Tiến vào Dị Vực chinh phạt Ma Tướng Thượng Cổ, săn rương chiến lợi phẩm và thu thập Ảo Trang biến hình độc bản.',
  },
  {
    id: 'hanh-trinh-nhan-duyen',
    title: 'Hành Trình Nhân Duyên',
    levelReq: 'Cấp 180',
    category: 'social',
    categoryLabel: 'Nhân Duyên & Thời Trang',
    image: '/mtc-showcase/feat_nhanduyen.jpg',
    summary: 'Kết bái tri kỷ và tổ chức hôn lễ Hòa Phong lộng lẫy, mở khóa phó bản phu thê cùng loạt cử chỉ tương tác đôi.',
  },
  {
    id: 'he-thong-do-pho',
    title: 'Thu Thập Đồ Phổ Yêu Linh',
    levelReq: 'Cấp 210',
    category: 'social',
    categoryLabel: 'Nhân Duyên & Thời Trang',
    image: '/mtc-showcase/feat_dopho.jpg',
    summary: 'Mở khóa Đồ Phổ Bách Quỷ với hàng chục danh họa Yêu Thần, kích hoạt bộ sưu tập để cộng dồn thuộc tính vĩnh viễn.',
  },
  {
    id: 'dai-yeu-man-hoang',
    title: 'Đại Yêu Man Hoang',
    levelReq: 'Cấp 240',
    category: 'boss',
    categoryLabel: 'Săn Boss Đại Yêu',
    image: '/mtc-showcase/feat_manhoang.jpg',
    summary: 'Khiêu chiến Xà Thần Man Hoang ở vùng đất cấm, tranh đoạt nguyên liệu Cộng Hưởng quý hiếm cùng đồng đội bang hội.',
  },
  {
    id: 'he-thong-cong-huong',
    title: 'Cộng Hưởng Thần Trang',
    levelReq: 'Cấp 240',
    category: 'boss',
    categoryLabel: 'Săn Boss Đại Yêu',
    image: '/mtc-showcase/feat_conghuong.jpg',
    summary: 'Kết tinh nguyên liệu từ Đại Yêu Man Hoang để Cộng Hưởng trang bị bậc cao, giúp lực chiến tăng vọt vượt ngưỡng.',
  },
  {
    id: 'di-vuc-lien-server',
    title: 'Dị Vực Liên Server',
    levelReq: 'SV Ngày 5',
    category: 'pk',
    categoryLabel: 'Chiến Trường PK',
    image: '/mtc-showcase/feat_liensv.jpg',
    summary: 'Quy tụ cao thủ từ khắp các máy chủ bước vào chiến trường liên thông, tranh giành tài nguyên và vinh quang tối thượng.',
  },
  {
    id: 'than-khi-lau',
    title: 'Thận Khí Lâu — Đoạt Trang Bị',
    levelReq: 'Cấp 320 • SV Ngày 8',
    category: 'boss',
    categoryLabel: 'Săn Boss Đại Yêu',
    image: '/mtc-showcase/feat_thankhilau.jpg',
    summary: 'Chinh phục Thận Khí Lâu nơi sương mù bao phủ, hạ gục Đại Yêu canh giữ để đoạt ngay bộ trang bị Thận Yêu cực phẩm.',
  },
  {
    id: 'doc-co-cau-bai',
    title: 'Vương Giả — Độc Cô Cầu Bại',
    levelReq: 'Thứ 5 Hàng Tuần',
    category: 'pk',
    categoryLabel: 'Chiến Trường PK',
    image: '/mtc-showcase/feat_docco.jpg',
    summary: 'Đấu trường PK đỉnh cao khai chiến mỗi Thứ 5 hàng tuần, tìm ra Vương Giả mạnh nhất định đoạt ngôi vị Độc Cô Cầu Bại.',
  },
];

export const MTC_WORLD_HIGHLIGHTS = [
  {
    id: 'le-duong-hoang-thanh',
    title: 'Lễ Đường Hoàng Thành',
    subtitle: 'Hội Tụ Bang Hội & Nghi Thức Kết Duyên',
    image: '/mtc-showcase/scene_palace.jpg',
    description:
      'Không gian cung đình rực rỡ ánh đèn lồng và cánh lá phong rơi — nơi tổ chức hôn lễ Nhân Duyên, yến tiệc Bang Hội và đại hội luận võ.',
  },
  {
    id: 'son-ha-cuu-chau',
    title: 'Họa Quyển Sơn Hà Cửu Châu',
    subtitle: 'Bản Đồ Thế Giới Mở Thủy Mặc',
    image: '/mtc-showcase/scene_worldmap.jpg',
    description:
      'Từ Bình An Trấn yên bình qua cầu gỗ sông Lam tới Tử Vực Man Hoang đầy yêu khí — mỗi vùng đất mở ra chuỗi kỳ ngộ và Thủ Lĩnh bản đồ riêng biệt.',
  },
  {
    id: 'anh-dao-linh-mieu',
    title: 'Thánh Địa Anh Đào Linh Miếu',
    subtitle: 'Nơi Khởi Nguồn Khế Ước Huyền Hồ',
    image: '/mtc-showcase/scene_sakura.jpg',
    description:
      'Ngôi miếu cổ bên cầu đỏ và rừng anh đào nở rộ bốn mùa — điểm dừng chân để tu luyện tâm pháp, triệu hồi Ngự Hồn và giao lưu hảo hữu.',
  },
];

export const MTC_QUICK_PILLARS = [
  {
    id: 'classes',
    title: 'Hệ Phái Đa Dạng',
    value: 'Tứ Đại Nghề',
    desc: 'Kiếm Sĩ, Vũ Cơ, Thương Sư, Cung Thủ khắc chế chiến thuật.',
  },
  {
    id: 'spirits',
    title: 'Hệ Thống Ngự Hồn',
    value: '50+ Thức Thần',
    desc: 'Triệu hồi & cộng hưởng linh thú Cửu Vĩ đồng hành chiến đấu.',
  },
  {
    id: 'pvp',
    title: 'Đấu Trường Đỉnh Cao',
    value: 'PK Liên Server',
    desc: 'Chiến trường Dị Vực, Công Thành Chiến & Độc Cô Cầu Bại.',
  },
  {
    id: 'fashion',
    title: 'Ngoại Trang & Tọa Kỵ',
    value: '100+ Ảo Hóa',
    desc: 'Thời trang Hòa Phong, cánh thần, pháp bảo & linh thú tuyệt mỹ.',
  },
];
