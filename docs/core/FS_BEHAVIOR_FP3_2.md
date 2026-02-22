# FS Behavior FP3.2 Delta

**Purpose:** Точные правила для Rename, Delete, Zip-upload open race.  
**Reference:** docs/fps/FP3_2.md, docs/core/API_FP3_DELTA.md.

---

## 1. Rename Path Rules

### Правило

```
toPath = dirname(fromPath) + newName [+ "/" если dir]
```

- **dirname(fromPath):** Родительская директория fromPath (с trailing slash).
- **newName:** Новое имя (basename), введённое пользователем.
- **Для dir:** toPath заканчивается на `/`.

### Примеры

| fromPath                                    | newName           | toPath                                        |
| ------------------------------------------- | ----------------- | --------------------------------------------- |
| `/@root/DISK_C/My Documents/Новая Папка 3/` | `Новая Папка 343` | `/@root/DISK_C/My Documents/Новая Папка 343/` |
| `/@root/DISK_C/My Documents/file.txt`       | `renamed.txt`     | `/@root/DISK_C/My Documents/renamed.txt`      |

### Запрещено

- **Cross-parent:** toPath в другой директории → Gateway 403 CROSS_PARENT.
- **Nested path:** toPath = fromPath + newName (ошибка: parent = сам item).

### Реализация (Explorer)

```ts
// dirname: убрать последний сегмент (с учётом trailing slash)
function dirname(apiPath: string): string {
  const trimmed = apiPath.replace(/\/$/, "");
  const idx = trimmed.lastIndexOf("/");
  return idx >= 0 ? trimmed.slice(0, idx + 1) : "";
}
const parentPath = dirname(fromPath);
const toPath = item.kind === "dir" ? parentPath + newName + "/" : parentPath + newName;
```

---

## 2. Delete: Request + UI

### Endpoint

| Method | Path           | Body               | Headers                      |
| ------ | -------------- | ------------------ | ---------------------------- |
| DELETE | /api/fs/delete | `{ path: string }` | X-System-App, X-System-Token |

### Ожидаемое поведение

| Этап                    | UI                                  | Backend              |
| ----------------------- | ----------------------------------- | -------------------- |
| 1. Right click → Delete | confirm dialog                      | —                    |
| 2. User confirms        | Spinner вместо label; tile остаётся | —                    |
| 3. Request sent         | —                                   | DELETE с path, token |
| 4. 204                  | Tile удаляется из DOM               | —                    |
| 5. 4xx/5xx              | Label восстанавливается; log error  | —                    |

### Проверка

- **E2E:** Right click Delete → confirm → assert network request (DELETE) sent; assert tile gone on 204.
- **Integration:** DELETE с token → 204; list → item отсутствует.

---

## 3. Zip Upload Open Race

### Ожидаемое поведение

**Первый open после zip upload обязан работать без refresh.**

| Сценарий                      | Ожидание                        |
| ----------------------------- | ------------------------------- |
| 1. Upload zip app (201)       | Файлы распакованы в S3          |
| 2. Сразу double click app-dir | POST open-url → 200, signed URL |
| 3. Shell открывает app window | iframe загружает index.html     |

### Возможные причины 404

- S3 eventual consistency: объект ещё не виден сразу после PutObject.
- Gateway open-url: HEAD/GET к S3 до того, как MinIO отразил запись.

### Решения (на выбор)

| Вариант                  | Описание                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- |
| **A. Retry**             | Explorer/Shell: при 404 на open-url — retry 2–3 раза с backoff (200–500ms).      |
| **B. Gateway delay**     | После upload-zip 201: gateway ждёт 100–200ms перед возвратом (не рекомендуется). |
| **C. Gateway retry**     | open-url при S3 NotFound: retry 1–2 раза с delay.                                |
| **D. MinIO consistency** | Проверить, что MinIO сразу отдаёт объект после PutObject (read-after-write).     |

**Рекомендация:** A (client retry) или C (gateway retry). Минимальная инвазия.

### Тест

- Upload zip → сразу POST open-url для `{path}/index.html` → assert 200 (с retry до 3 попыток, 500ms между).
