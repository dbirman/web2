using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.EventSystems;

public class CardClickBehavior : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void OpenModal(int idx);

    [SerializeField] private int _modalIdx;
    [SerializeField] private CameraRotatorBehavior camRotatorBehav;

    private void OnMouseOver()
    {
        // Play the mouse over animation for this card
    }

    private void OnMouseDown()
    {
        if (Input.GetMouseButtonDown(0))
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            OpenModal(_modalIdx);
#endif
#if UNITY_EDITOR
            Debug.Log($"Clicked modal {_modalIdx}");
#endif
            camRotatorBehav.SetControlBlock(true);
        }
    }

}
