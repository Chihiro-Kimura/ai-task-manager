import json
import sys
from typing import Any, Dict, Optional

from transformers import (
    AutoModelForSeq2SeqGeneration,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Pipeline,
    pipeline,
)

MODEL_CACHE = {}

def read_input() -> Dict[str, Any]:
    """標準入力からJSONデータを読み取ります"""
    try:
        return json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON input: {str(e)}"}

def write_output(data: Dict[str, Any]) -> None:
    """結果をJSON形式で標準出力に書き込みます"""
    print(json.dumps(data, ensure_ascii=False))

def get_pipeline(
    task: str,
    model_name: str,
    max_length: Optional[int] = None,
    **kwargs
) -> Pipeline:
    """モデルのパイプラインを取得します（キャッシュ付き）"""
    cache_key = f"{task}_{model_name}"
    if cache_key not in MODEL_CACHE:
        MODEL_CACHE[cache_key] = pipeline(
            task,
            model=model_name,
            tokenizer=model_name,
            max_length=max_length,
            **kwargs
        )
    return MODEL_CACHE[cache_key]

def format_error(message: str) -> Dict[str, str]:
    """エラーメッセージを整形します"""
    return {"error": message} 