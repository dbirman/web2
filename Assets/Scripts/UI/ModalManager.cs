using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class ModalManager : MonoBehaviour
{
    public static ModalManager Instance;
    public static bool ModalOpen;

    [SerializeField] private List<UIDocument> _modals;

    private void Awake()
    {
        Instance = this;
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
}
