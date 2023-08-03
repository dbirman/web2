using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class ModalManager : MonoBehaviour
{
    public static ModalManager Instance;
    public static bool ModalOpen;

    [SerializeField] private List<UIDocument> _modals;

    [SerializeField] private UIDocument _scienceDocument;

    private void Awake()
    {
        Instance = this;

        SetupPDFLinks();
    }

    public static void CloseModal(GameObject modal)
    {
        modal.SetActive(false);

        if (Instance._modals.TrueForAll(x => !x.isActiveAndEnabled))
            ModalOpen = false;
    }

    public static void ShowModal(int index)
    {
        Instance._modals[index].gameObject.SetActive(true);
        Instance._modals[index].rootVisualElement.Q<Button>("exit-button").clicked += delegate { CloseModal(Instance._modals[index].gameObject); };

        ModalOpen = true;
    }

    private void SetupPDFLinks()
    {
        List<string> papers = new List<string>
        {
            "pinpoint-paper-button",
            "bwm-paper-button",
            "repro-paper-button",
            "conv-paper-button",
            "attawe-paper-button",
            "cohcon-paper-button"
        };

        _scienceDocument.gameObject.SetActive(true);

        foreach (string paper in papers)
        {
            var paperButton = _scienceDocument.rootVisualElement.Q<Button>(paper);
            paperButton.clicked +=
                delegate { Application.OpenURL(paperButton.tooltip); };
        }

        _scienceDocument.gameObject.SetActive(false);
    }
}
