const REPOSITORY_OWNER = "miguel-montalvo1991";
const REPOSITORY_NAME = "-geoservi-app";

export async function listOpenIssues(req, res, next) {
  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "GeoServi-App",
    };

    // Opcional. No hace falta configurar un token para probar el repositorio público.
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/issues?state=open&per_page=30`,
      { headers, signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return res.status(502).json({
        message: "No se pudieron consultar las tareas de GitHub en este momento.",
      });
    }

    const issues = await response.json();

    // GitHub incluye Pull Requests en el endpoint de issues; los excluimos.
    const data = issues
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        assignee: issue.assignee?.login ?? null,
        labels: issue.labels.map((label) => label.name),
        updatedAt: issue.updated_at,
      }));

    return res.json({ issues: data });
  } catch (error) {
    next(error);
  }
}