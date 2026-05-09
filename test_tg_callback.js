require('dotenv').config();
const url = 'https://kularqssbxqcsksdlhyf.supabase.co/functions/v1/telegram-bot';
const payload = {
  callback_query: {
    id: 'test_query_id',
    data: 'approve_test_request_id',
    message: { message_id: 12345 }
  }
};
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then(r=>r.text()).then(console.log).catch(console.error);
