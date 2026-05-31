-- Bật realtime cho bảng messages để không cần F5 khi nhận tin nhắn
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Nếu bạn cần bật cho các bảng khác nữa thì bỏ comment các dòng dưới nhé:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_requests;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.rent_requests;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.boosting_requests;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
