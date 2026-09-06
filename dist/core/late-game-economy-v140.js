// V140 late-game economy read-model. Realm ascension has no catalyst requirement.
export function lateGameEconomySummaryV140(state) {
  return {
    schema: 'late-game-economy.v140',
    policy: 'Phó Bản farm nguyên liệu cho từng hệ nâng cấp; Thăng Cảnh chỉ dùng Tu Vi và không yêu cầu môi giới/catalyst.',
    terminalSink: { resourceId: 'resource.first_dawn_fragment', name: 'Sơ Quang Tàn Phiến', use: 'Sáng Thế Chủ viên mãn dùng khi khai Kỷ Nguyên mới' },
  };
}
