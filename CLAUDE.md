# Claude Development Guidelines

## Backend (Elixir/Phoenix + PostgreSQL)

### Structure

- **Policies**: Keep in relevant context folder (e.g., `lib/backend/notes/policies/`)
- **Schemas**: Keep in context folder (e.g., `lib/backend/notes/note.ex`)
- **Context queries**: Keep in context file (e.g., `lib/backend/notes/notes.ex`)
- **Controllers**: `lib/backend_web/controllers/`
- **JSON Views**: `lib/backend_web/controllers/json/` - Phoenix automatically resolves views based on naming convention

### Schema Configuration

- **Primary IDs**: Always use UUIDs

  ```elixir
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  ```

- **Field Attributes**: Use module attributes to define fields for changesets

  ```elixir
  @required_fields [:email, :content]
  @optional_fields [:name, :title, :tags]
  @all_fields @required_fields ++ @optional_fields

  def changeset(schema, attrs) do
    schema
    |> cast(attrs, @all_fields)
    |> validate_required(@required_fields)
  end
  ```

### Controllers

- **Always declare action_fallback**: Add `action_fallback BackendWeb.FallbackController` at the top
- **Use `with` statements**: Handle all business logic with `with`, let errors propagate to fallback controller
- **No error handling in controllers**: NEVER use `case`, `else` blocks, or manual error responses
- **Session parameter**: All controller actions receive `session` as the third parameter (injected automatically)
  - For authenticated routes: `session` contains the current user struct (with id, roles, etc.)
  - For public routes: `session` is `nil` (prefix parameter with `_` to avoid unused warnings)
  - **CRITICAL**: NEVER extract fields from session (e.g., `session.id`). Always pass the entire `session` object to context functions
  - Context functions will access `session.id` internally when needed
  - This allows for future expansion (roles, permissions, etc.) without controller changes
- **Pattern**: `def action(conn, params, session) do ... end`

  ```elixir
  # ✅ Good - Pass entire session to context
  def show(conn, %{"id" => id}, session) do
    with {:ok, note} <- Notes.get_note(id, session) do
      conn
      |> put_status(:ok)
      |> render(:show, note: note)
    end
  end

  # ✅ Good - Multiple steps with session
  def update(conn, %{"id" => id} = params, session) do
    with {:ok, note} <- Notes.get_note(id, session),
         {:ok, updated_note} <- Notes.update_note(note, params) do
      conn
      |> put_status(:ok)
      |> render(:show, note: updated_note)
    end
  end

  # ✅ Good - Pass session directly to Accounts functions
  def update_profile(conn, params, session) do
    with {:ok, updated_user} <- Accounts.update_profile(session, params) do
      conn
      |> put_status(:ok)
      |> render(:show, user: updated_user)
    end
  end

  # ✅ Good - Public action (no authentication)
  def get_public_note(conn, %{"share_token" => token}, _session) do
    with {:ok, note} <- Notes.get_note_by_share_token(token) do
      conn
      |> put_status(:ok)
      |> render(:show_public, note: note)
    end
  end

  # ❌ Bad - Extracting session.id
  def show(conn, %{"id" => id}, session) do
    user_id = session.id  # NEVER do this!
    with {:ok, note} <- Notes.get_note(id, user_id) do
      # ...
    end
  end

  # ❌ Bad - Using conn.assigns.current_user
  def show(conn, %{"id" => id}) do
    user_id = conn.assigns.current_user.id  # Don't access assigns directly
    # ...
  end

  # ❌ Bad - Wrong number of parameters
  def show(conn, %{"id" => id}) do  # Missing session parameter
    # ...
  end
  ```

### Fallback Controller

- **Centralized error handling**: All controller errors handled in one place
- **Location**: `lib/backend_web/controllers/fallback_controller.ex`
- **Pattern matching**: Handle specific error tuples returned by context functions

  ```elixir
  defmodule BackendWeb.FallbackController do
    use BackendWeb, :controller

    # Handle specific errors
    def call(conn, {:error, :not_found}) do
      conn
      |> put_status(:not_found)
      |> json(%{error: "Resource not found"})
    end

    def call(conn, {:error, :unauthorized}) do
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Unauthorized"})
    end

    # Handle changeset errors
    def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
      conn
      |> put_status(:unprocessable_entity)
      |> json(%{errors: translate_errors(changeset)})
    end
  end
  ```

### JSON Views

- **Never use json() in controllers** - ALWAYS use `render()` with JSON view modules
- **Location**: `lib/backend_web/controllers/json/`
- **Naming**: `UserJSON`, `NoteJSON`, `AuthJSON`, etc. (Phoenix automatically resolves)
- **No imports needed**: Phoenix finds views by naming convention
- **Exception**: Only `FallbackController` may use `json()` directly for centralized error handling

  ```elixir
  # ✅ Good - Controller uses render()
  def show(conn, %{"id" => id}, session) do
    with {:ok, note} <- Notes.get_note(id, session) do
      conn
      |> put_status(:ok)
      |> render(:show, note: note)
    end
  end

  def verify_code(conn, %{"email" => email, "code" => code}, _session) do
    with {:ok, user} <- Accounts.verify_auth_code(email, code),
         {:ok, token, _claims} <- Token.generate_token(user) do
      conn
      |> put_status(:ok)
      |> render(:auth_success, token: token, user: user)
    end
  end

  # JSON View (lib/backend_web/controllers/json/note_json.ex)
  defmodule BackendWeb.NoteJSON do
    def show(%{note: note}) do
      %{note: data(note)}
    end

    defp data(note) do
      %{id: note.id, content: note.content, ...}
    end
  end

  # JSON View (lib/backend_web/controllers/json/auth_json.ex)
  defmodule BackendWeb.AuthJSON do
    def auth_success(%{token: token, user: user}) do
      %{
        token: token,
        user: %{
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          provider: user.provider,
          onboarding_complete: user.onboarding_complete
        }
      }
    end
  end

  # ❌ Bad - Using json() in controller
  def show(conn, %{"id" => id}, session) do
    with {:ok, note} <- Notes.get_note(id, session) do
      conn
      |> put_status(:ok)
      |> json(%{note: %{id: note.id, ...}})  # NEVER do this!
    end
  end
  ```

### Context Functions

- **Accept session, not user_id**: Context functions should accept the full `session` struct
- **Extract user_id inside context**: Access `session.id` within the context function, not in controllers
- **Future-proof**: Session will contain roles, permissions, and other auth data
- **Pattern**: Functions that need user context accept `session` as parameter
- **Exception**: Functions called from public routes AND authenticated routes should accept both

  ```elixir
  # ✅ Good - Context accepts session
  def get_note(id, session) do
    case Repo.get_by(Note, id: id, user_id: session.id) do
      nil -> {:error, :not_found}
      note -> {:ok, note}
    end
  end

  def list_notes(session) do
    Note
    |> where([n], n.user_id == ^session.id)
    |> order_by([n], desc: n.updated_at)
    |> Repo.all()
  end

  # ✅ Good - Accounts functions accept session (which is a User struct)
  def update_profile(%User{} = session, attrs) do
    session
    |> User.changeset(attrs)
    |> Repo.update()
  end

  # ✅ Good - Functions used in both authenticated and public contexts
  # Use pattern matching to accept both session struct and user_id
  def search_notes(query, session_or_user_id, limit \\ 10)

  def search_notes(query, %{id: user_id}, limit) do
    search_notes_by_user_id(query, user_id, limit)
  end

  def search_notes(query, user_id, limit) when is_binary(user_id) do
    search_notes_by_user_id(query, user_id, limit)
  end

  defp search_notes_by_user_id(query, user_id, limit) do
    # Actual implementation
  end

  # ❌ Bad - Accepting user_id instead of session
  def get_note(id, user_id) do  # Should accept session
    # ...
  end
  ```

### Naming Conventions

- Use snake_case for all fields: `user_id`, `inserted_at`, `updated_at`
- Array fields need explicit defaults in migrations

### Vector Search (Qdrant + Embeddings)

- **Architecture**: Flask service handles embeddings + Qdrant operations (completely local!)
- **Location**:
  - Flask service: `docker/embeddings/app.py`
  - Elixir client: `lib/backend/qdrant/vector_service.ex`
- **Sync Strategy**: PostgreSQL is source of truth, Qdrant is eventually consistent
  - On create: Insert to DB → Flask indexes (embedding + Qdrant) - log error if fails
  - On update: Update DB → Flask re-indexes - log error if fails
  - On delete: Delete from DB → Flask deletes from Qdrant - log error if fails
- **Environment**: Set `VECTOR_SERVICE_URL=http://localhost:5000` in `.env` files
- **Setup**:
  1. Start Docker: `cd docker && docker-compose up -d`
  2. Initialize: `mix qdrant.setup`
- **Local Development**: Works 100% offline with sentence-transformers model

## Frontend (React Native/Expo)

### Project Structure

```
src/
  screens/          # Screen components
    ScreenName/
      index.tsx     # Main screen component
      styles/       # Screen-specific styles
        index.ts
      utils/        # Screen-specific utilities
  components/       # Reusable components
    ComponentName/
      index.tsx
      styles/
  services/         # API services (shared)
    api.ts
```

### Screen Guidelines

- **Self-contained**: Keep API calls, logic, and state within the screen
- **Styles**: Create dedicated `styles/` folder within screen folder
- **Utils/Helpers**: Keep screen-specific utils in screen's `utils/` folder

### API Integration

- Backend uses snake_case: `content`, `inserted_at`, `updated_at`
- Frontend types must match backend exactly
- Always use backend API, not AsyncStorage for persistence
- Implement full CRUD: list → display → create → update → delete

### Code Style Rules

1. **Promises over async/await**: Use `.then()` and `.catch()` instead of async/await

   ```typescript
   // ✅ Good
   fetchData()
     .then((data) => {
       processData(data);
       return saveData(data);
     })
     .catch((error) => {
       console.error(error);
     });

   // ❌ Bad
   async function example() {
     try {
       const data = await fetchData();
       processData(data);
       await saveData(data);
     } catch (error) {
       console.error(error);
     }
   }
   ```

2. **No unnecessary try-catch**: Don't wrap code in try-catch unnecessarily
   - Let errors propagate naturally through promise chains
   - Only catch errors where you can meaningfully handle them
   - Use `.catch()` at the end of promise chains for error handling

3. **No unnecessary error handling**: Don't try to handle errors you can't fix
   - Log errors for debugging but don't add complex error recovery logic
   - Let the system fail fast and show user-friendly error messages

### Critical Rules

1. **Auth persistence**: Clear invalid tokens on 401/403
2. **Haptics**: Use lowercase enum values (`"light"`, `"medium"`, `"heavy"`)
3. **Data fetching**: Use `useFocusEffect` to reload on screen focus
4. **Delete operations**: Sync with backend immediately, update UI optimistically
5. **Navigation**: Only redirect on auth state changes, not screen changes

## Quick Reference

### Backend Field Names

- ✅ `content`, `inserted_at`, `updated_at`, `user_id`
- ❌ `body`, `createdAt`, `updatedAt`, `userId`

### Frontend Best Practices

- Pull-to-refresh on list screens
- Loading states for async operations
- Error handling with user-facing alerts
- Backend sync for all data operations
