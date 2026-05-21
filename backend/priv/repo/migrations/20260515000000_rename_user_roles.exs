defmodule Backend.Repo.Migrations.RenameUserRoles do
  use Ecto.Migration

  def up do
    execute "UPDATE users SET role = 'user' WHERE role = 'club_goer'"
    execute "UPDATE users SET role = 'admin' WHERE role = 'club_owner'"
  end

  def down do
    execute "UPDATE users SET role = 'club_goer' WHERE role = 'user'"
    execute "UPDATE users SET role = 'club_owner' WHERE role = 'admin'"
  end
end
