using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UIElements;

public class ModalManager : MonoBehaviour
{
    public static ModalManager Instance;
    public static bool ModalOpen;
    public static UIDocument ActiveModal;

    private bool _thisFrame;

    [SerializeField] private SceneController _sceneController;
    [SerializeField] private List<UIDocument> _modals;

    [SerializeField] private UIDocument _scienceDocument;

    private void Awake()
    {
        Instance = this;

        SetupPDFLinks();
    }

    private void Update()
    {
        if (!_thisFrame && ModalOpen && !EventSystem.current.IsPointerOverGameObject() && Input.GetMouseButtonDown(0))
        {
            // left click anywhere
            CloseModal(ActiveModal.gameObject);
        }
        _thisFrame = false;
    }

    public static void CloseModal(GameObject modal)
    {
        modal.SetActive(false);

        if (Instance._modals.TrueForAll(x => !x.isActiveAndEnabled))
            ModalOpen = false;
    }

    public static void ShowModal(int index)
    {
        if (ModalOpen)
            return;

        if (index <= 2)
        {
            ActiveModal = Instance._modals[index];
            ActiveModal.gameObject.SetActive(true);
            ActiveModal.rootVisualElement.Q<Button>("exit-button").clicked += delegate { CloseModal(Instance._modals[index].gameObject); };
            ActiveModal.rootVisualElement.Q<VisualElement>("unity-content-and-vertical-scroll-container").pickingMode = PickingMode.Ignore;
            ActiveModal.rootVisualElement.Q<VisualElement>("unity-content-viewport").pickingMode = PickingMode.Ignore;
            ActiveModal.rootVisualElement.Q<VisualElement>("unity-content-container").pickingMode = PickingMode.Ignore;

            ModalOpen = true;
            Instance._thisFrame = true;
        }
        else if (index == 3)
        {
            Application.OpenURL("https://volcano.danbirman.com");
        }
        else if (index == 4)
        {
            Instance._sceneController.ChangeScene(true);
        }
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
