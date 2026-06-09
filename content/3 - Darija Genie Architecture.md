 2026-06-01 16:25

Status:

Tags:

# Darija Genie Architecture

#### Model View Controller (For separation of Concern between Client and Server)

The **MVC** has three components
1) Model : For Data handling
2) View: For Data Presentation
3) Controller that handles Events

![[Pasted image 20260601162856.png]]
(1)
#### MPV (For Client side)

![[Pasted image 20260601162904.png]]
(1)

```mermaid
flowchart TB
    %% Define the distinct domains %%
    subgraph Client [Front-End]
        RN("React Native & TS")
    end

    subgraph Backend [Backend Core]
        Vercel{"Vercel AI-SDK"}
        Node["Node.js & Express"]
    end

    subgraph DB [Database]
        Redis[("Redis Cache")]
        MySQL[("MySQL")]
    end

    subgraph Env [Environment]
        Nginx["Nginx"]
        S3(["Amazon S3"])
    end

    subgraph DevOps [CI / CD]
        Jenkins{"Jenkins & Docker"}
    end

    subgraph Tools [Tooling]
        Git["GitLab & Jira"]
    end

    %% Map the relationships (Arrows) %%
    Client <-->|API Requests| Node
    
    Node <--> Vercel
    Node <--> Redis
    Node <--> MySQL
    
    Node <--> Nginx
    Nginx <-->|Fetch Audio| S3
    
    Jenkins -->|Deploys to| Env
    Git -->|Triggers Pipeline| Jenkins
    
    %% Add some basic styling for professionalism %%
    style Client fill:#e3f2fd,stroke:#90caf9
    style Backend fill:#e8f5e9,stroke:#a5d6a7
    style DB fill:#ffebee,stroke:#ef9a9a
    style Env fill:#fff3e0,stroke:#ffcc80
    style DevOps fill:#f3e5f5,stroke:#ce93d8
    style Tools fill:#fffde7,stroke:#fff59d
```

**CI/CD**: We will use Jenkins and Docker to containerize the application and simplify making changes and delivering new software versions.

### References

1) [Architecture](https://khalilstemmler.com/articles/client-side-architecture/architecture)

---

