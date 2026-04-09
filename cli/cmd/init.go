package cmd

import (
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/jex-app/cli/internal/api"
	"github.com/jex-app/cli/internal/auth"
	"github.com/jex-app/cli/internal/config"
	"github.com/jex-app/cli/internal/errs"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize a .envault file in the current directory",
	RunE:  runInit,
}

func init() {
	rootCmd.AddCommand(initCmd)
}

// listItem implements list.Item for Bubble Tea list.
type listItem struct{ title, desc string }

func (i listItem) Title() string       { return i.title }
func (i listItem) Description() string { return i.desc }
func (i listItem) FilterValue() string { return i.title }

// pickerModel is a minimal Bubble Tea model for single-selection lists.
type pickerModel struct {
	list     list.Model
	choice   string
	quitting bool
}

func (m pickerModel) Init() tea.Cmd { return nil }

func (m pickerModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "enter":
			if i, ok := m.list.SelectedItem().(listItem); ok {
				m.choice = i.title
			}
			m.quitting = true
			return m, tea.Quit
		case "q", "ctrl+c":
			m.quitting = true
			return m, tea.Quit
		}
	}
	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m pickerModel) View() string {
	if m.quitting {
		return ""
	}
	return "\n" + m.list.View()
}

var docStyle = lipgloss.NewStyle().Margin(1, 2)

func pickFromList(title string, items []list.Item) (string, error) {
	l := list.New(items, list.NewDefaultDelegate(), 40, 14)
	l.Title = title
	l.SetShowStatusBar(false)
	l.SetFilteringEnabled(false)

	m, err := tea.NewProgram(pickerModel{list: l}).Run()
	if err != nil {
		return "", err
	}
	result := m.(pickerModel)
	if result.choice == "" {
		return "", fmt.Errorf("no selection made")
	}
	return result.choice, nil
}

func runInit(cmd *cobra.Command, args []string) error {
	apiURL, _ := cmd.Flags().GetString("api-url")
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")

	token, err := auth.Load()
	if err != nil {
		fmt.Fprintln(os.Stderr, "Not authenticated. Run jex login.")
		os.Exit(1)
	}

	client, err := api.New(apiURL, token, allowInsecure)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	projects, err := client.ListProjects()
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, apiURL))
		os.Exit(1)
	}
	if len(projects) == 0 {
		return fmt.Errorf("no projects found. Create one in the Jex dashboard first")
	}

	var projectID string
	if len(projects) == 1 {
		projectID = projects[0].ID
		fmt.Printf("Using project: %s\n", projects[0].Name)
	} else {
		items := make([]list.Item, len(projects))
		for i, p := range projects {
			items[i] = listItem{title: p.ID, desc: p.Name}
		}
		projectID, err = pickFromList("Select a project", items)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	}

	envs, err := client.ListEnvs(projectID)
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, apiURL))
		os.Exit(1)
	}
	if len(envs) == 0 {
		return fmt.Errorf("no environments found for this project")
	}

	var defaultEnv string
	if len(envs) == 1 {
		defaultEnv = envs[0].Name
		fmt.Printf("Using environment: %s\n", defaultEnv)
	} else {
		items := make([]list.Item, len(envs))
		for i, e := range envs {
			items[i] = listItem{title: e.Name, desc: fmt.Sprintf("%d secrets", e.SecretsCount)}
		}
		defaultEnv, err = pickFromList("Select default environment", items)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	}

	_ = docStyle // used for consistent styling reference

	if err := config.Write(projectID, defaultEnv, apiURL); err != nil {
		return fmt.Errorf("failed to write .envault: %w", err)
	}

	fmt.Println("Initialized. .envault created.")
	return nil
}
