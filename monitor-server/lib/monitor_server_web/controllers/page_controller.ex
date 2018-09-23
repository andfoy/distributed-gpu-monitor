defmodule MonitorServerWeb.PageController do
  use MonitorServerWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
