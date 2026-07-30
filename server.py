import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DEFAULT_UPSTAGE_KEY = os.getenv("UPSTAGE_API_KEY", "up_2Tym25ZOXlznGcfuApwqoSlBkHdNk")

class DocGPServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                req_data = json.loads(post_data.decode('utf-8'))
                user_msg = req_data.get('message', '')
                user_key = req_data.get('apiKey', '').strip()
                
                api_key = user_key if user_key else DEFAULT_UPSTAGE_KEY
                
                if not api_key:
                    self._send_json({"error": "API Key가 설정되어 있지 않습니다."}, 400)
                    return

                # Upstage Solar API 엔드포인트 호출 (OpenAI 호환)
                upstage_url = "https://api.upstage.ai/v1/chat/completions"
                payload = {
                    "model": "solar-pro",
                    "messages": [
                        {
                            "role": "system",
                            "content": "너는 전주시 특화 1차 방문 진료과 추천 AI 가이드 DocGP이다. 환자의 증상을 듣고 친절하게 1차 방문 추천 진료과(정형외과, 내과, 신경과, 이비인후과 등)와 전주 지역 1·2차 대표 병원을 3문장 이내로 명확하게 권장해라. 절대로 단정적인 의학적 진단을 내리지 말고 1차 진료과 네비게이션 가이드임을 밝혀라."
                        },
                        {
                            "role": "user",
                            "content": user_msg
                        }
                    ]
                }
                
                req = urllib.request.Request(
                    upstage_url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    },
                    method="POST"
                )
                
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_bytes = resp.read()
                    resp_json = json.loads(resp_bytes.decode('utf-8'))
                    bot_reply = resp_json['choices'][0]['message']['content']
                    self._send_json({"reply": bot_reply}, 200)

            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore')
                self._send_json({"error": f"Upstage API HTTP Error ({e.code}): {err_body}"}, e.code)
            except Exception as e:
                self._send_json({"error": f"서버 오류: {str(e)}"}, 500)
        else:
            self.send_error(404, "Endpoint Not Found")

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), DocGPServerHandler) as httpd:
        print(f"DocGP 웹 서비스 & Upstage AI 챗봇 서버가 실행되었습니다: http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n서버를 종료합니다.")
